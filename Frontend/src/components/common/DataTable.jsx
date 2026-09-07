import { useMemo, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  HStack,
  Text,
  IconButton,
  Flex,
  Icon,
  Skeleton,
} from '@chakra-ui/react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

/**
 * Tableau de données réutilisable — tri, pagination, état vide et loading.
 *
 * @param {Array} columns   [{ key, label, sortable, isNumeric, render(row) }]
 * @param {Array} data      Données déjà filtrées par le parent (recherche / filtres)
 * @param {Function} [renderActions] (row) => ReactNode — colonne Actions
 * @param {number} [pageSize=8]
 * @param {boolean} [isLoading=false]
 * @param {string} [emptyMessage]
 */
export default function DataTable({
  columns,
  data,
  renderActions,
  pageSize = 8,
  isLoading = false,
  emptyMessage = 'Aucun résultat trouvé.',
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv), 'fr')
        : String(bv).localeCompare(String(av), 'fr');
    });
    return copy;
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  return (
    <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="ink.200" boxShadow="card" overflow="hidden">
      <TableContainer>
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              {columns.map((col) => (
                <Th key={col.key} isNumeric={col.isNumeric} whiteSpace="nowrap">
                  {col.sortable ? (
                    <HStack
                      spacing={1}
                      cursor="pointer"
                      onClick={() => handleSort(col.key)}
                      userSelect="none"
                      justify={col.isNumeric ? 'flex-end' : 'flex-start'}
                    >
                      <Text>{col.label}</Text>
                      <Icon
                        as={sortKey === col.key ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown}
                        boxSize={3.5}
                        color={sortKey === col.key ? 'brand.600' : 'ink.400'}
                      />
                    </HStack>
                  ) : (
                    col.label
                  )}
                </Th>
              ))}
              {renderActions && <Th textAlign="right">الإجراءات</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <Tr key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <Td key={col.key}><Skeleton h="16px" borderRadius="md" /></Td>
                  ))}
                  {renderActions && <Td><Skeleton h="16px" borderRadius="md" /></Td>}
                </Tr>
              ))}

            {!isLoading && paginated.length === 0 && (
              <Tr>
                <Td colSpan={columns.length + (renderActions ? 1 : 0)} border="none">
                  <Flex direction="column" align="center" justify="center" py={12} gap={2}>
                    <Icon as={Inbox} boxSize={7} color="ink.400" />
                    <Text fontSize="sm" color="ink.400">{emptyMessage}</Text>
                  </Flex>
                </Td>
              </Tr>
            )}

            {!isLoading &&
              paginated.map((row, idx) => (
                <Tr key={row.id ?? idx} _hover={{ bg: 'ink.50' }} transition="background 0.12s ease">
                  {columns.map((col) => (
                    <Td key={col.key} isNumeric={col.isNumeric} whiteSpace="nowrap">
                      {col.render ? col.render(row) : row[col.key]}
                    </Td>
                  ))}
                  {renderActions && (
                    <Td>
                      <Flex justify="flex-end">{renderActions(row)}</Flex>
                    </Td>
                  )}
                </Tr>
              ))}
          </Tbody>
        </Table>
      </TableContainer>

      {!isLoading && sortedData.length > 0 && (
        <Flex
          justify="space-between"
          align="center"
          px={4}
          py={3}
          borderTop="1px solid"
          borderColor="ink.100"
          flexWrap="wrap"
          gap={2}
        >
          <Text fontSize="xs" color="ink.500" dir="rtl">
  عرض{' '}
  <span dir="ltr">
    {(currentPage - 1) * pageSize + 1}–
    {Math.min(currentPage * pageSize, sortedData.length)}
  </span>{' '}
  من{' '}
  <span dir="ltr">
    {sortedData.length}
  </span>
</Text>
          <HStack spacing={1}>

            <IconButton
              aria-label="Page suivante"
              icon={<ChevronRight size={16} />}
              size="xs"
              variant="outline"
              isDisabled={currentPage === 1}
              onClick={() => setPage((p) => Math.min(totalPages, p - 1))}
            />
          
            <Text fontSize="xs" color="ink.600" px={2}>
              صفحة {currentPage} / {totalPages}
            </Text>
          <IconButton
              aria-label="Page précédente"
              icon={<ChevronLeft size={16} />}
              size="xs"
              variant="outline"
              isDisabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.max(1, p + 1))}
            />

            
          </HStack>
        </Flex>
      )}
    </Box>
  );
}
