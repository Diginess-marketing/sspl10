import { useState, useEffect, useCallback } from 'react';

interface UseEnhancedModalOptions {
  enableEscapeKey?: boolean;
  enableClickOutside?: boolean;
  closeOnMount?: boolean;
  onClose?: () => void;
}

export const useEnhancedModal = (options: UseEnhancedModalOptions = {}) => {
  const {
    enableEscapeKey = true,
    enableClickOutside = true,
    closeOnMount = false,
    onClose,
  } = options;

  const [isOpen, setIsOpen] = useState(!closeOnMount);

  // Handle ESC key to close modal
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen && enableEscapeKey) {
      setIsOpen(false);
      onClose?.();
    }
  }, [isOpen, enableEscapeKey, onClose]);

  // Handle click outside to close modal
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget && isOpen && enableClickOutside) {
      setIsOpen(false);
      onClose?.();
    }
  }, [isOpen, enableClickOutside, onClose]);

  // Add keyboard event listener
  useEffect(() => {
    if (isOpen && enableEscapeKey) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown, enableEscapeKey]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Use requestAnimationFrame to avoid forced reflow
      requestAnimationFrame(() => {
        // Add scrollbar compensation if needed
        if (window.innerWidth > document.documentElement.clientWidth) {
          document.body.style.paddingRight = '15px';
        }
        
        document.body.style.overflow = 'hidden';
      });

      return () => {
        requestAnimationFrame(() => {
          document.body.style.overflow = originalOverflow;
          document.body.style.paddingRight = originalPaddingRight;
        });
      };
    }
  }, [isOpen]);

  // Control functions
  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggleModal = useCallback(() => {
    if (isOpen) {
      closeModal();
    } else {
      openModal();
    }
  }, [isOpen, openModal, closeModal]);

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      const previouslyFocusedElement = document.activeElement as HTMLElement;

      // Focus the modal or first focusable element
      setTimeout(() => {
        const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
        if (modalElement) {
          modalElement.focus();
        }
      }, 0);

      // Restore focus on close
      return () => {
        if (previouslyFocusedElement) {
          previouslyFocusedElement.focus();
        }
      };
    }
  }, [isOpen]);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    handleBackdropClick,
    // Props for easy integration
    modalProps: {
      open: isOpen,
      onOpenChange: (open: boolean) => {
        setIsOpen(open);
        if (!open) onClose?.();
      },
      onClick: enableClickOutside ? handleBackdropClick : undefined,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-hidden': !isOpen,
    },
  };
};

export default useEnhancedModal;