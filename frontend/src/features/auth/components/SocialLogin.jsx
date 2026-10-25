import Button from '@/components/ui/Button';
import { GithubIcon, GoogleIcon } from '@/components/icons/BrandIcons';

const PROVIDERS = [
  { name: 'Google', icon: GoogleIcon },
  { name: 'GitHub', icon: GithubIcon },
];

export default function SocialLogin({ onSelect, disabled }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="h-px flex-1 bg-gray-800" />
        or continue with
        <span className="h-px flex-1 bg-gray-800" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PROVIDERS.map(({ name, icon: Icon }) => (
          <Button
            key={name}
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={() => onSelect(name)}
          >
            <Icon className="h-4 w-4" />
            {name}
          </Button>
        ))}
      </div>
    </div>
  );
}
