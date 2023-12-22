import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  endpoint: "serverImage" | "messageFile";
  value: string;
  onChange: (value: string) => void;
}
export function FileUpload({
  endpoint,
  value,
  onChange
}: FileUploadProps) {
  const type = value.split(".").pop();

  if (type && (type === "png" || type === "jpeg" || type === "jpg")) {
    return (
      <div className="relative h-24 w-24">
        <Image
          className="rounded-full object-cover"
          fill
          src={value}
          alt="server image"
          sizes="50 50"
        />
        <button
          className="absolute -top-1 right-1 bg-rose-400 p-1
          rounded-full hover:cursor-pointer"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>
    )
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        console.log("Uploadthing Error: ", error);
      }}
    />
  )

}