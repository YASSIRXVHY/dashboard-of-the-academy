import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const doc = new jsPDF();
if (typeof (doc as any).autoTable === 'function') {
  console.log('autoTable on prototype works');
} else {
  console.log('autoTable on prototype does NOT work');
}
