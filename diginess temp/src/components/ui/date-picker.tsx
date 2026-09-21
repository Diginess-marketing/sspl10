import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  allowManualInput?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  className,
  disabled = false,
  allowManualInput = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(
    date ? format(date, 'dd-MM-yyyy') : '',
  );

  // Update input value when date changes externally
  React.useEffect(() => {
    if (date) {
      setInputValue(format(date, 'dd-MM-yyyy'));
    } else {
      setInputValue('');
    }
  }, [date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Only allow numbers and hyphens
    value = value.replace(/[^0-9-]/g, '');

    // Auto-format as DD-MM-YYYY
    if (value.length <= 10) {
      // Remove existing hyphens for processing
      const numbersOnly = value.replace(/-/g, '');

      let formatted = numbersOnly;
      if (numbersOnly.length >= 3 && numbersOnly.length <= 4) {
        formatted = `${numbersOnly.slice(0, 2)  }-${  numbersOnly.slice(2)}`;
      } else if (numbersOnly.length >= 5 && numbersOnly.length <= 8) {
        formatted = `${numbersOnly.slice(0, 2)  }-${  numbersOnly.slice(2, 4)  }-${  numbersOnly.slice(4)}`;
      } else if (numbersOnly.length > 8) {
        formatted = `${numbersOnly.slice(0, 2)  }-${  numbersOnly.slice(2, 4)  }-${  numbersOnly.slice(4, 8)}`;
      }

      value = formatted;
    }

    setInputValue(value);

    // Try to parse the date
    if (value && value.length === 10) {
      const parsedDate = parse(value, 'dd-MM-yyyy', new Date());
      if (isValid(parsedDate)) {
        onDateChange?.(parsedDate);
      }
    } else {
      onDateChange?.(undefined);
    }
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate);
    setIsOpen(false);
  };

  if (allowManualInput) {
    return (
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className={cn('pr-10', className)}
          disabled={disabled}
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              disabled={disabled}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleCalendarSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange?.(selectedDate);
            setIsOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}