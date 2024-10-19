"use client"

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, X } from 'lucide-react';
import { Session } from './Sidebar';

const formSchema = z.object({
  images: z.instanceof(FileList).refine((files) => files.length > 0, 'At least one image is required'),
});

type ImageDescription = {
  file: File;
  description: string;
  isLoading: boolean;
};

type ImageUploadProps = {
  currentSession: Session | null;
  onSessionUpdate: (session: Session) => void;
};

export default function ImageUpload({ currentSession, onSessionUpdate }: ImageUploadProps) {
  const [imageDescriptions, setImageDescriptions] = useState<ImageDescription[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: undefined,
    },
  });

  useEffect(() => {
    if (currentSession) {
      setImageDescriptions(currentSession.images.map(img => ({ ...img, isLoading: false })));
    } else {
      setImageDescriptions([]);
    }
  }, [currentSession]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentSession) {
      toast({
        title: "Error",
        description: "Please select or create a session first",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const newImages = Array.from(values.images).map(file => ({ file, description: '', isLoading: true }));
    setImageDescriptions(prev => [...prev, ...newImages]);

    for (let i = 0; i < newImages.length; i++) {
      const formData = new FormData();
      formData.append('image', newImages[i].file);

      try {
        const response = await fetch('/api/generate-description', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to generate description');
        }

        const data = await response.json();
        setImageDescriptions(prev => 
          prev.map((item, index) => 
            index === imageDescriptions.length + i 
              ? { ...item, description: data.description, isLoading: false } 
              : item
          )
        );
      } catch (error) {
        console.error('Error:', error);
        setImageDescriptions(prev => 
          prev.map((item, index) => 
            index === imageDescriptions.length + i 
              ? { ...item, description: 'Failed to generate description', isLoading: false } 
              : item
          )
        );
        toast({
          title: "Error",
          description: `Failed to generate description for ${newImages[i].file.name}`,
          variant: "destructive",
        });
      }
    }

    setIsSubmitting(false);
    form.reset();
    
    // Update the current session with new images
    const updatedSession = {
      ...currentSession,
      images: [...currentSession.images, ...newImages.map(img => ({ file: img.file, description: img.description }))],
    };
    onSessionUpdate(updatedSession);

    toast({
      title: "Success",
      description: "All descriptions generated successfully.",
    });
  };

  const removeImage = (index: number) => {
    if (currentSession) {
      const updatedImages = imageDescriptions.filter((_, i) => i !== index);
      setImageDescriptions(updatedImages);
      const updatedSession = {
        ...currentSession,
        images: updatedImages.map(img => ({ file: img.file, description: img.description })),
      };
      onSessionUpdate(updatedSession);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload Images</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting || !currentSession}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Descriptions'
            )}
          </Button>
        </form>
      </Form>
      {imageDescriptions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Generated Descriptions:</h2>
          <ul className="space-y-4">
            {imageDescriptions.map((item, index) => (
              <li key={index} className="bg-gray-100 p-4 rounded-md relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <p className="font-semibold mb-2">{item.file.name}</p>
                {item.isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating description...
                  </div>
                ) : (
                  <p>{item.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}