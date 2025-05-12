declare module 'react-big-calendar' {
  import { ComponentType, ReactNode } from 'react';
  
  export interface CalendarProps<TEvent = any> {
    date?: Date;
    defaultDate?: Date;
    defaultView?: string;
    events: TEvent[];
    localizer: Localizer;
    onNavigate?: (newDate: Date, view?: string, action?: NavigateAction) => void;
    onView?: (view: string) => void;
    onSelectEvent?: (event: TEvent, e: React.SyntheticEvent) => void;
    onSelectSlot?: (slotInfo: { start: Date; end: Date; slots: Date[] | string[]; action: 'select' | 'click' | 'doubleClick'; }) => void;
    onDrillDown?: (date: Date, view: string) => void;
    onSelecting?: (range: { start: Date; end: Date }) => boolean | undefined;
    selected?: TEvent;
    views?: string[] | { [viewName: string]: boolean | ComponentType<any> };
    view?: string;
    selectable?: boolean;
    longPressThreshold?: number;
    popup?: boolean;
    popupOffset?: number | { x: number; y: number };
    startAccessor?: ((event: TEvent) => Date) | string;
    endAccessor?: ((event: TEvent) => Date) | string;
    allDayAccessor?: ((event: TEvent) => boolean) | string;
    titleAccessor?: ((event: TEvent) => string) | string;
    tooltipAccessor?: ((event: TEvent) => string) | string;
    eventPropGetter?: (event: TEvent, start: Date, end: Date, isSelected: boolean) => { className?: string; style?: React.CSSProperties };
    slotPropGetter?: (date: Date) => { className?: string; style?: React.CSSProperties };
    dayPropGetter?: (date: Date) => { className?: string; style?: React.CSSProperties };
    components?: {
      event?: ComponentType<any>;
      eventWrapper?: ComponentType<any>;
      dayWrapper?: ComponentType<any>;
      dateCellWrapper?: ComponentType<any>;
      toolbar?: ComponentType<any>;
      agenda?: {
        date?: ComponentType<any>;
        time?: ComponentType<any>;
        event?: ComponentType<any>;
      };
      day?: {
        header?: ComponentType<any>;
        event?: ComponentType<any>;
      };
      week?: {
        header?: ComponentType<any>;
        event?: ComponentType<any>;
      };
      month?: {
        header?: ComponentType<any>;
        dateHeader?: ComponentType<any>;
        event?: ComponentType<any>;
      };
    };
    formats?: {
      dateFormat?: string | ((date: Date, culture: string, localizer: Localizer) => string);
      dayFormat?: string | ((date: Date, culture: string, localizer: Localizer) => string);
      weekdayFormat?: string | ((date: Date, culture: string, localizer: Localizer) => string);
      timeGutterFormat?: string | ((date: Date, culture: string, localizer: Localizer) => string);
      monthHeaderFormat?: string | ((date: Date, culture: string, localizer: Localizer) => string);
      dayHeaderFormat?: string | ((date: Date, culture: string, localizer: Localizer) => string);
      dayRangeHeaderFormat?: string | ((range: { start: Date; end: Date }, culture: string, localizer: Localizer) => string);
      agendaHeaderFormat?: string | ((date: Date, culture: string, localizer: Localizer) => string);
      selectRangeFormat?: string | ((range: { start: Date; end: Date }, culture: string, localizer: Localizer) => string);
      agendaDateFormat?: string | ((date: Date, culture: string, localizer: Localizer) => string);
      agendaTimeFormat?: string | ((date: Date, culture: string, localizer: Localizer) => string);
      agendaTimeRangeFormat?: string | ((range: { start: Date; end: Date }, culture: string, localizer: Localizer) => string);
    };
    messages?: {
      allDay?: string;
      previous?: string;
      next?: string;
      today?: string;
      month?: string;
      week?: string;
      day?: string;
      agenda?: string;
      date?: string;
      time?: string;
      event?: string;
      noEventsInRange?: string;
      showMore?: (total: number) => string;
    };
    timeslots?: number;
    step?: number;
    min?: Date;
    max?: Date;
    scrollToTime?: Date;
    culture?: string;
    drilldownView?: string | null;
    eventTimeRangeFormat?: string;
    eventTimeRangeStartFormat?: string;
    eventTimeRangeEndFormat?: string;
    rtl?: boolean;
    style?: React.CSSProperties;
    className?: string;
    elementProps?: React.HTMLAttributes<HTMLElement>;
    getNow?: () => Date;
    showMultiDayTimes?: boolean;
  }

  export type NavigateAction = 'PREV' | 'NEXT' | 'TODAY' | 'DATE';

  export interface FormatterFunction {
    (value: Date, format: string, options?: object): string;
  }

  export interface ParserFunction {
    (str: string, format: string, options?: object): Date;
  }

  export interface Localizer {
    format: FormatterFunction;
    parse: ParserFunction;
    startOfWeek: (date: Date) => Date;
    getDay: (date: Date) => number;
    localize?: any;
    messages?: any;
    propType?: any;
  }

  export function dateFnsLocalizer(config: {
    format: Function;
    parse: Function;
    startOfWeek: Function;
    getDay: Function;
    locales: { [key: string]: any };
  }): Localizer;

  export const Views: {
    MONTH: string;
    WEEK: string;
    WORK_WEEK: string;
    DAY: string;
    AGENDA: string;
  };

  export const Calendar: React.FC<CalendarProps>;

  export default Calendar;
}