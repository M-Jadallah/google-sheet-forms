import { Button } from "@/components/ui/button";
import { Download, RotateCcw, CheckCircle2 } from "lucide-react";

interface DownloadResultProps {
  pdfUrl: string;
  onReset: () => void;
}

export const DownloadResult = ({ pdfUrl, onReset }: DownloadResultProps) => {
  return (
    <div className="text-center space-y-5 md:space-y-6 py-8 md:py-12 animate-in">
      <div className="flex justify-center mb-4 md:mb-6">
        <div className="rounded-full bg-success/10 p-3 md:p-4">
          <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-success" />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-foreground px-4">تم إنشاء الملف بنجاح!</h2>
      <p className="text-base md:text-lg text-muted-foreground px-4">ملف PDF جاهز للتحميل</p>

      <div className="flex flex-col gap-3 md:gap-4 pt-4">
        <Button
          asChild
          className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-gradient-to-r from-success to-success/80 hover:opacity-90 shadow-lg transition-all duration-300 hover:scale-[1.02]"
        >
          <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
            <Download className="ml-2 h-5 w-5" />
            تحميل الملف
          </a>
        </Button>

        <Button
          onClick={onReset}
          variant="outline"
          className="w-full h-12 md:h-14 text-base md:text-lg border-2 hover:bg-accent transition-all duration-300"
        >
          <RotateCcw className="ml-2 h-5 w-5" />
          إنشاء ملف جديد
        </Button>
      </div>
    </div>
  );
};
