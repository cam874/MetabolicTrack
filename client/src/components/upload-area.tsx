import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CloudUpload } from "lucide-react";

interface UploadAreaProps {
  userId: string;
}

export default function UploadArea({ userId }: UploadAreaProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("userId", userId);
      formData.append("sourceApp", "unknown");
      formData.append("status", "pending");

      const response = await apiRequest("POST", "/api/data-imports", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your screenshot is being processed. We'll extract the data shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/data-imports"] });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload screenshot",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploading(true);
      uploadMutation.mutate(file);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Your Data</h3>
        
        <div 
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive 
              ? "border-primary bg-indigo-50" 
              : "border-gray-300 hover:border-primary"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          data-testid="dropzone-upload"
        >
          <input {...getInputProps()} />
          <div className="group-hover:scale-105 transition-transform">
            <CloudUpload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
              isDragActive ? "text-primary" : "text-gray-400"
            }`} />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {uploading ? "Uploading..." : "Upload Screenshot"}
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              {isDragActive 
                ? "Drop your screenshot here" 
                : "Drag and drop your current app's progress screenshot here"
              }
            </p>
            <Button 
              disabled={uploading}
              className="bg-primary text-white hover:bg-indigo-700"
              data-testid="button-choose-file"
            >
              {uploading ? "Processing..." : "Choose File"}
            </Button>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Supported apps: MyFitnessPal, Lose It!, WW, Noom, and more
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
