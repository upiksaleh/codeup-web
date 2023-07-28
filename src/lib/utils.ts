
export function formatDate(date: string, showFormated: boolean = true) {
    const currentDate = new Date();
    const targetDate = new Date(date);
  
    const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
    const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
    const daysAgo = currentDate.getDate() - targetDate.getDate();
  
    let formattedDate = '';
  
    if (yearsAgo > 0) {
      formattedDate = `${yearsAgo} tahun lalu`;
    } else if (monthsAgo > 0) {
      formattedDate = `${monthsAgo} bulan lalu`;
    } else if (daysAgo > 0) {
      formattedDate = `${daysAgo} hari lalu`;
    } else {
      formattedDate = 'Hari Ini';
    }
  
    const fullDate = targetDate.toLocaleString('id-ID', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  
    return `${fullDate}${showFormated ? ` (${formattedDate})` : '' }`;
  }
  