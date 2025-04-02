import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-2 flex flex-col justify-center items-center', className)}
      locale={ko}
      captionLayout="dropdown"
      labels={{
        labelMonthDropdown: () => '',
        labelYearDropdown: () => '',
      }}
      classNames={{
        months: 'flex flex-col space-y-2 items-center',
        month: 'space-y-2 flex flex-col items-center',
        caption: 'flex justify-center pt-1 relative items-center mb-2 w-full',
        caption_label: 'text-sm font-medium hidden',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1 mx-auto',
        head_row: 'flex justify-center',
        head_cell: 'text-muted-foreground rounded-md w-7 font-normal text-[0.7rem] text-center',
        row: 'flex w-full mt-1 justify-center',
        cell: cn(
          'relative p-0 text-center text-xs focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-7 w-7 p-0 font-normal aria-selected:opacity-100 text-xs',
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:
          'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        dropdown:
          'p-1 rounded-md bg-white shadow-md min-w-[5rem] max-h-[10rem] overflow-y-auto text-center',
        dropdown_month: 'p-1 text-center rounded-md hover:bg-gray-100 focus:bg-gray-100 text-sm',
        dropdown_year: 'p-1 text-center rounded-md hover:bg-gray-100 focus:bg-gray-100 text-sm',
        caption_dropdowns: 'flex flex-row-reverse justify-center gap-3 items-center',
        dropdown_icon: 'hidden',
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn('h-3 w-3', className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn('h-3 w-3', className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
