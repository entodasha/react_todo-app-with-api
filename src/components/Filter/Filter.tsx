import React from 'react';
import { SortType } from '../../types/sortField';
import { FilterItem } from '../../types/filterItem';

type Props = {
  sortField: SortType;
  filterItems: FilterItem[];
  onFilter: (field: SortType) => void;
};

export const Filter: React.FC<Props> = ({
  sortField,
  filterItems,
  onFilter,
}) => {
  return (
    <nav className="filter" data-cy="Filter">
      {filterItems.map(filterItem => (
        <a
          key={filterItem.field}
          href={`#/${filterItem.field === SortType.default ? '' : filterItem.field}`}
          className={`filter__link ${sortField === filterItem.field ? 'selected' : ''}`}
          data-cy={filterItem.dataCy}
          onClick={() => onFilter(filterItem.field)}
        >
          {filterItem.label}
        </a>
      ))}
    </nav>
  );
};
