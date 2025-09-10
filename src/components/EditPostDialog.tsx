import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Post {
  id: number;
  caption: string;
  image: string;
  likes: number;
  timestamp: string;
}

interface EditPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (postId: number, newCaption: string) => void;
  post: Post | null;
}

export const EditPostDialog: React.FC<EditPostDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  post
}) => {
  const [caption, setCaption] = useState('');

  useEffect(() => {
    if (post) {
      setCaption(post.caption);
    }
  }, [post]);

  const handleSave = () => {
    if (post && caption.trim()) {
      onSave(post.id, caption.trim());
      onClose();
    }
  };

  const handleClose = () => {
    setCaption('');
    onClose();
  };

  return (
    <Dialog open={isOpen && !!post} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Post Caption</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Update your caption..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};