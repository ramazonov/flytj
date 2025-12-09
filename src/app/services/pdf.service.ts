import {Injectable} from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.vfs;

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor() {
  }

  async generateTicketPdf(ticketData: any, passengerData: any): Promise<void> {
    try {
      const passengerName = this.getPassengerName(passengerData);
      const documentType = this.getDocumentType(passengerData);
      const ticketNumber = ticketData.data.airline_booking_number || 'Не указан';
      const bookingNumber = ticketData.data.booking_number || 'Не указан';
      const createdDate = this.formatDate(ticketData.createdDateTime);

      const flightData = this.prepareFlightData(
        ticketData.data.routes?.[0]?.segments || [],
        ticketData
      );

      const routeInfo = this.getRouteInfo(ticketData);

      const documentDefinition = {
        content: [
          {text: 'Авиабилет', style: 'documentHeader'},

          {text: 'Маршрут', style: 'sectionHeader'},
          {text: routeInfo, style: 'routeInfo', margin: [0, 0, 0, 10]},

          {
            table: {
              widths: ['*', '*', '*'],
              body: [
                [
                  {text: 'Номер бронирования', style: 'tableHeader'},
                  {text: 'Локатор для онлайн регистрации', style: 'tableHeader'},
                  {text: 'Дата выпуска билета', style: 'tableHeader'}
                ],
                [
                  bookingNumber,
                  'Не указан', // Пока оставляем пустым
                  createdDate
                ]
              ]
            },
            margin: [0, 0, 0, 20]
          },

          {text: 'Информация о пассажирах', style: 'sectionHeader'},
          {
            table: {
              widths: ['*', '*', '*'],
              body: [
                [
                  {text: 'ФИО Пассажира', style: 'tableHeader'},
                  {text: 'Документ', style: 'tableHeader'},
                  {text: 'Номер билета', style: 'tableHeader'}
                ],
                [passengerName, documentType, ticketNumber]
              ]
            },
            margin: [0, 0, 0, 20]
          },

          {text: 'Подробная информация о рейсах', style: 'sectionHeader'},
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*', '*', '*'],
              body: [
                [
                  {text: 'Рейс', style: 'tableHeader'},
                  {text: 'Вылет', style: 'tableHeader'},
                  {text: 'Прибытие', style: 'tableHeader'},
                  {text: 'Время в пути', style: 'tableHeader'},
                  {text: 'Класс', style: 'tableHeader'},
                  {text: 'Багаж', style: 'tableHeader'}
                ],
                ...flightData
              ]
            }
          }
        ],
        styles: {
          documentHeader: {
            fontSize: 22,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 20],
            color: '#2c3e50'
          },
          sectionHeader: {
            fontSize: 16,
            bold: true,
            margin: [0, 0, 0, 10],
            color: '#3498db'
          },
          routeInfo: {
            fontSize: 14,
            bold: true,
            margin: [0, 0, 0, 15],
            color: '#16a085'
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
            color: '#ffffff',
            fillColor: '#3498db',
            alignment: 'center'
          },
          flightRoute: {
            fontSize: 12,
            bold: false
          }
        },
        defaultStyle: {
          font: 'Roboto',
          fontSize: 12
        }
      };

      // @ts-ignore
      pdfMake.createPdf(documentDefinition).download(`Билет_${ticketNumber}.pdf`);
    } catch (error) {
      console.error('Ошибка при генерации PDF:', error);
      throw error;
    }
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'Не указано';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', '');
    } catch (e) {
      console.warn('Не удалось форматировать дату:', dateString, e);
      return dateString;
    }
  }

  private getRouteInfo(ticketData: any): string {
    const segments = ticketData.data.routes?.[0]?.segments || [];
    if (segments.length === 0) return 'Маршрут не указан';

    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    const departureCity = ticketData.data.included?.city?.[firstSegment.departure?.city]?.name?.ru ||
      firstSegment.departure?.city || 'Не указано';
    const arrivalCity = ticketData.data.included?.city?.[lastSegment.arrival?.city]?.name?.ru ||
      lastSegment.arrival?.city || 'Не указано';

    return `${departureCity} - ${arrivalCity}` +
      (segments.length > 1 ? ` (${segments.length} пересад${segments.length === 1 ? 'ка' : 'ки'})` : '');
  }

  private getPassengerName(passengerData: any): string {
    if (!passengerData) return 'Не указано';
    return `${passengerData.surName || ''} ${passengerData.firstName || ''} ${passengerData.middleName || ''}`.trim();
  }

  private getDocumentType(passengerData: any): string {
    if (!passengerData) return 'Не указано';
    return passengerData.documentType === 'passport' ? 'Паспорт' : 'ID карта';
  }

  private prepareFlightData(segments: any[], ticketData: any): any[] {
    return segments.map(segment => {
      const departureCity = ticketData.data.included?.city?.[segment.departure?.city]?.name?.ru ||
        segment.departure?.city || 'Не указано';
      const arrivalCity = ticketData.data.included?.city?.[segment.arrival?.city]?.name?.ru ||
        segment.arrival?.city || 'Не указано';
      const airportFrom = segment.departure?.airport || '';
      const airportTo = segment.arrival?.airport || '';

      const firstPassenger = ticketData.data.passengers?.[0];
      const cabinClass = firstPassenger?.cabin_code === 'Y' ? 'Эконом' : 'Бизнес';

      const baggage = this.getBaggageText(segment.baggage || firstPassenger?.baggage);

      return [
        {text: `${departureCity} (${airportFrom}) -\n${arrivalCity} (${airportTo})`, style: 'flightRoute'},
        this.formatDateTime(segment.departure?.time),
        this.formatDateTime(segment.arrival?.time),
        this.convertDuration(segment.duration || 0),
        cabinClass,
        baggage
      ];
    });
  }

  private formatDateTime(datetime: string): string {
    if (!datetime) return 'Не указано';
    try {
      // Пытаемся распарсить дату в формате "DD.MM.YYYY HH:mm"
      if (/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/.test(datetime)) {
        const [datePart, timePart] = datetime.split(' ');
        const [day, month, year] = datePart.split('.');
        return `${day}.${month}.${year} ${timePart}`;
      }

      // Для других форматов используем стандартный парсинг
      const date = new Date(datetime);
      if (isNaN(date.getTime())) return datetime;

      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', '');
    } catch (e) {
      console.warn('Не удалось распарсить дату:', datetime, e);
      return datetime;
    }
  }

  private getBaggageText(baggage: any): string {
    if (!baggage) return 'Нет данных';
    if (typeof baggage === 'string') return baggage; // Если уже строка (например "20KG")
    if (baggage.checked) return `${baggage.checked} кг`;
    if (baggage.allowance) return `${baggage.allowance} кг`;
    return 'Нет данных';
  }

  private convertDuration(duration: number): string {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}ч ${minutes}м`;
  }
}
