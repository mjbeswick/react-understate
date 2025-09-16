import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchDocuments, SearchDocument } from '../data/searchData';
import './Search.css';

type SearchProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SearchResult = SearchDocument & {
  score: number;
  highlights: {
    title?: string;
    content?: string;
  };
};

// Simple but effective search function
const performSearch = (
  query: string,
  documents: SearchDocument[],
): Array<{ item: SearchDocument; score: number }> => {
  if (!query.trim()) return [];

  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(' ').filter(term => term.length > 0);

  const results = documents.map(doc => {
    let score = 0;

    // Search in title (highest weight)
    const titleLower = doc.title.toLowerCase();
    queryTerms.forEach(term => {
      if (titleLower.includes(term)) {
        const index = titleLower.indexOf(term);
        score += index === 0 ? 20 : 10; // Higher score for beginning matches
      }
    });

    // Search in content
    const contentLower = doc.content.toLowerCase();
    queryTerms.forEach(term => {
      if (contentLower.includes(term)) {
        score += 3;
      }
    });

    // Search in section
    const sectionLower = doc.section.toLowerCase();
    queryTerms.forEach(term => {
      if (sectionLower.includes(term)) {
        score += 5;
      }
    });

    // Boost exact matches
    const fullText = `${titleLower} ${contentLower} ${sectionLower}`;
    if (fullText.includes(queryLower)) {
      score += 15;
    }

    return { item: doc, score };
  });

  return results
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score);
};

const SearchModal: React.FC<SearchProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Simple highlight function
  const highlightMatches = (text: string, query: string): string => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.split(' ').filter(Boolean).join('|')})`,
      'gi',
    );
    return text.replace(regex, '<mark>$1</mark>');
  };

  // Perform search
  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const searchResults = performSearch(query, searchDocuments);

    return searchResults.slice(0, 8).map(
      (result): SearchResult => ({
        ...result.item,
        score: result.score,
        highlights: {
          title: highlightMatches(result.item.title, query),
          content: highlightMatches(
            result.item.content.slice(0, 150) + '...',
            query,
          ),
        },
      }),
    );
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        navigate(results[selectedIndex].path);
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, results, selectedIndex, navigate]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Reset query when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const Hit = ({ result, index }: { result: SearchResult; index: number }) => {
    const handleClick = () => {
      navigate(result.path);
      onClose();
    };

    const isSelected = index === selectedIndex;

    return (
      <div
        className={`search-hit ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
      >
        <div className="search-hit-content">
          <div
            className="search-hit-title"
            dangerouslySetInnerHTML={{
              __html: result.highlights.title || result.title,
            }}
          />
          <div className="search-hit-path">
            {result.hierarchy.lvl0}{' '}
            {result.hierarchy.lvl1 && `> ${result.hierarchy.lvl1}`}
          </div>
          <div
            className="search-hit-snippet"
            dangerouslySetInnerHTML={{
              __html: result.highlights.content || result.content,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="search-modal-overlay">
      <div className="search-modal" ref={modalRef}>
        <div className="search-modal-header">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documentation..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="search-input"
            autoComplete="off"
            spellCheck="false"
          />
          <button onClick={onClose} className="search-close">
            ✕
          </button>
        </div>

        <div className="search-results">
          {results.length > 0 ? (
            <div className="search-hits-list">
              {results.map((result, index) => (
                <Hit key={result.objectID} result={result} index={index} />
              ))}
            </div>
          ) : query.trim() ? (
            <div className="search-empty">
              <p>No results found for "{query}"</p>
              <p className="search-empty-help">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : (
            <div className="search-empty">
              <p>Start typing to search documentation...</p>
            </div>
          )}
        </div>

        <div className="search-footer">
          <span className="search-footer-text">
            ⌘K to search • ↑↓ to navigate • ↵ to select • ESC to close
          </span>
        </div>
      </div>
    </div>
  );
};

export const SearchButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => {
  return (
    <button className="search-button" onClick={onClick}>
      <span className="search-button-text">Search documentation...</span>
      <span className="search-button-shortcut">⌘K</span>
    </button>
  );
};

export default SearchModal;
