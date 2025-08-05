import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Key } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export const ApiKeyInput = ({ onApiKeySubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
      localStorage.setItem('replicate_api_key', apiKey.trim());
    }
  };

  // Check for existing API key in localStorage
  const savedApiKey = localStorage.getItem('replicate_api_key');
  if (savedApiKey) {
    onApiKeySubmit(savedApiKey);
    return null;
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>API Key Required</CardTitle>
          <CardDescription>
            Enter your Replicate API key to use virtual try-on features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Replicate API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="r8_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={!apiKey.trim()}>
              Continue
            </Button>
          </form>
          
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
            <p className="text-muted-foreground mb-2">
              Don't have an API key?
            </p>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://replicate.com/account/api-tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Get API Key
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};