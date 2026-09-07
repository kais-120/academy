import { InputGroup, InputLeftElement, InputRightElement, Input, IconButton } from '@chakra-ui/react';
import { Search, X } from 'lucide-react';

/**
 * Barre de recherche réutilisable — recherche instantanée contrôlée par le parent.
 */
export default function SearchBar({ value, onChange, placeholder = 'Rechercher…', w = { base: 'full', md: '280px' } }) {
  return (
    <InputGroup w={w} size="sm" dir='rtl'>
      <InputLeftElement pointerEvents="none" h="full" pl={1}>
        <Search size={16} color="var(--chakra-colors-ink-400)" />
      </InputLeftElement>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        borderRadius="lg"
        bg="white"
        border="1px solid"
        borderColor="ink.200"
        _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)' }}
        _placeholder={{ color: 'ink.400' }}
      />
      {value && (
        <InputRightElement h="full">
          <IconButton
            aria-label="Effacer la recherche"
            icon={<X size={14} />}
            size="xs"
            variant="ghost"
            onClick={() => onChange('')}
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
}
