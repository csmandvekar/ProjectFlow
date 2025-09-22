import { useState, useRef } from "react";
import { Upload, X, File, Image, FileText, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
}

interface FileUploadProps {
  taskId: string;
  projectId: string;
  attachments: Attachment[];
  onFileUploaded: (attachment: Attachment) => void;
  onFileDeleted: (attachmentId: string) => void;
}

export function FileUpload({ taskId, projectId, attachments, onFileUploaded, onFileDeleted }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('archive')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "File size must be less than 10MB",
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/zip'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Only images, documents, and archives are allowed",
      });
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(
        `/projects/${projectId}/tasks/${taskId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(progress);
          },
        }
      );

      onFileUploaded(response.data.attachment);
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.response?.data?.message || "Failed to upload file",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteFile = async (attachmentId: string) => {
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`);
      onFileDeleted(attachmentId);
      toast({
        title: "File deleted",
        description: "File has been deleted successfully",
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.response?.data?.message || "Failed to delete file",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
        <div className="text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop files here, or click to select
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
          >
            {uploading ? 'Uploading...' : 'Select Files'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          />
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Attachments ({attachments.length})</h4>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <Card key={attachment._id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(attachment.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)} • {attachment.uploadedBy.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.url, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(attachment._id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
