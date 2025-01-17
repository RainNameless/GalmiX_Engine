import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { LoginForm } from './LoginForm';
import { APIConfig } from './APIConfig';

interface EditorDialogsProps {
  showLoginDialog: boolean;
  setShowLoginDialog: (show: boolean) => void;
  showAPIConfig: boolean;
  setShowAPIConfig: (show: boolean) => void;
  onLoginSuccess: () => void;
  onSaveAPIConfig: (config: any) => void;
}

export const EditorDialogs: React.FC<EditorDialogsProps> = ({
  showLoginDialog,
  setShowLoginDialog,
  showAPIConfig,
  setShowAPIConfig,
  onLoginSuccess,
  onSaveAPIConfig,
}) => {
  return (
    <>
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>后台管理登录</DialogTitle>
            <DialogDescription>请输入您的管理员密码以访问编辑功能。</DialogDescription>
          </DialogHeader>
          <LoginForm onSuccess={onLoginSuccess} />
        </DialogContent>
      </Dialog>
      <Dialog open={showAPIConfig} onOpenChange={setShowAPIConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API设置</DialogTitle>
            <DialogDescription>配置您的API密钥和其他相关设置。</DialogDescription>
          </DialogHeader>
          <APIConfig onSave={onSaveAPIConfig} />
        </DialogContent>
      </Dialog>
    </>
  );
};

