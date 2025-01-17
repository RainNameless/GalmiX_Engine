import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'react-hot-toast';

interface SavedUrlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  error?: string;
}

export const SavedUrlDialog: React.FC<SavedUrlDialogProps> = ({ isOpen, onClose, url, error }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{error ? '操作失败' : '保存成功'}</DialogTitle>
          <DialogDescription>
            {error ? '处理您的请求时发生错误' : '您可以使用以下链接访问存档'}
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <div className="text-red-500 py-4">{error}</div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Input
                id="url"
                value={url}
                readOnly
                className="col-span-3"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={onClose}>{error ? '关闭' : '完成'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

