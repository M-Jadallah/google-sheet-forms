import { Button } from "@/components/ui/button";
import { Download, RotateCcw, CheckCircle2 } from "lucide-react";

interface DownloadResultProps {
  pdfUrl: string;
  onReset: () => void;
}

export const DownloadResult = ({ pdfUrl, onReset }: DownloadResultProps) => {
  return (
    <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-success/10 p-4">
          <CheckCircle2 className="w-16 h-16 text-success" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-foreground">تم إنشاء الملف بنجاح!</h2>
      <p className="text-lg text-muted-foreground">ملف PDF جاهز للتحميل</p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button
          asChild
          className="bg-gradient-to-r from-success to-success/80 hover:opacity-90 text-lg py-6 px-8 shadow-lg transition-all duration-300 hover:scale-[1.02]"
        >
          <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
            <Download className="ml-2 h-5 w-5" />
            تحميل الملف
          </a>
        </Button>

        <Button
          onClick={onReset}
          variant="outline"
          className="text-lg py-6 px-8 border-2 hover:bg-accent transition-all duration-300"
        >
          <RotateCcw className="ml-2 h-5 w-5" />
          إنشاء ملف جديد
        </Button>
      </div>
    </div>
  );
};
