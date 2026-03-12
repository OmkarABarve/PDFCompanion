import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { usePdfStore } from '../stores/pdfStore';

export default function FileUpload() {
  const setPdf = usePdfStore((s) => s.setPdf);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) setPdf(file);
    },
    [setPdf]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div
        {...getRootProps()}
        className={`flex w-full max-w-lg cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-colors
          ${
            isDragActive
              ? 'border-accent bg-accent/10'
              : 'border-gray-300 hover:border-accent dark:border-white/20 dark:hover:border-accent'
          }`}
      >
        <input {...getInputProps()} />

        {isDragActive ? (
          <Upload className="h-14 w-14 animate-bounce text-accent" />
        ) : (
          <FileText className="h-14 w-14 text-gray-400 dark:text-gray-500" />
        )}

        <p className="text-center text-lg font-medium">
          {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF, or click to browse'}
        </p>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Supports any PDF file — even large ones (100 MB+)
        </p>
      </div>
    </div>
  );
}
