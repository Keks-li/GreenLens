import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * GreenLens Municipal PDF Report Generator
 * Generates official, high-resolution municipal intelligence reports
 */
export const generateMunicipalPdfReport = ({
  reportType = 'executive', // 'executive', 'drainage', 'incidents', 'users'
  municipality = { name: 'Winneba Municipal Assembly', region: 'Central Region' },
  generatedBy = 'Municipal Command Lead',
  kpis = {},
  drainageSegments = [],
  incidents = [],
  fieldTeams = [],
  citizenRewards = [],
  usersList = [],
  weather = null
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Color Palette Constants
  const PRIMARY_COLOR = [5, 150, 105]; // #059669 Emerald
  const DARK_PRIMARY = [6, 95, 70]; // #065f46 Deep Green
  const TEXT_DARK = [30, 41, 59]; // #1e293b Slate 800
  const TEXT_MUTED = [100, 116, 139]; // #64748b Slate 500
  const BG_LIGHT = [240, 253, 244]; // #f0fdf4 Light Emerald
  const CRITICAL_COLOR = [220, 38, 38]; // Red 600

  // 1. Header Banner
  doc.setFillColor(...DARK_PRIMARY);
  doc.rect(0, 0, 210, 32, 'F');

  // GreenLens Logo & Seal
  doc.setFillColor(...PRIMARY_COLOR);
  doc.roundedRect(14, 6, 20, 20, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('GL', 19, 19);

  // Title & Subtitle in Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GREENLENS MUNICIPAL COMMAND CENTER', 38, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(209, 250, 229);
  doc.text(`${municipality.name.toUpperCase()} • ${municipality.region.toUpperCase()}, GHANA`, 38, 20);
  doc.text('Hydrometeorological Drainage Intelligence & Urban Climate Resilience', 38, 25);

  // Document Type Ribbon
  let reportTitle = 'Executive Environmental & Operations Briefing';
  let reportRef = `GL-REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  if (reportType === 'drainage') {
    reportTitle = 'Hydraulic Conduit & Digital Twin Telemetry Audit';
  } else if (reportType === 'incidents') {
    reportTitle = 'Incident Log & Field Dispatch Operations Audit';
  } else if (reportType === 'users') {
    reportTitle = 'Municipal Personnel & Citizen Rewards Ledger';
  }

  doc.setFillColor(255, 255, 255);
  doc.setTextColor(...TEXT_DARK);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle, 14, 44);

  // Metadata Box
  doc.setFillColor(...BG_LIGHT);
  doc.roundedRect(14, 48, 182, 18, 2, 2, 'F');
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 48, 182, 18, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_PRIMARY);
  doc.text('REPORT REFERENCE:', 18, 54);
  doc.text('GENERATED ON:', 80, 54);
  doc.text('ISSUING OFFICER:', 140, 54);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_DARK);
  doc.text(reportRef, 18, 60);
  doc.text(`${currentDate} at ${currentTime}`, 80, 60);
  doc.text(generatedBy, 140, 60);

  let currentY = 74;

  // 2. Executive Key Metric Highlights (Cards)
  const totalReports = incidents.length;
  const criticalDrains = drainageSegments.filter(s => s.riskLevel === 'critical' || s.riskScore >= 80).length;
  const wasteTons = kpis?.wasteRemoved?.value ?? '0.0';
  const weatherTemp = weather?.temp || '--°C';
  const weatherRain = weather?.rain24hMm != null ? `${weather.rain24hMm} mm` : '0.0 mm';

  const cardWidth = 43;
  const cardHeight = 20;
  const cardGap = 3.3;

  const metrics = [
    { label: 'REPORTS TODAY', val: String(kpis?.reportsToday?.value || totalReports), sub: 'Active Citizen Logs' },
    { label: 'CRITICAL CONDUITS', val: String(criticalDrains), sub: 'Risk Index ≥ 80' },
    { label: 'REFUSE REMOVED', val: `${wasteTons} T`, sub: 'Diverted from Drains' },
    { label: '24H RAINFALL', val: weatherRain, sub: `${weatherTemp} • Telemetry` }
  ];

  metrics.forEach((m, idx) => {
    const cardX = 14 + idx * (cardWidth + cardGap);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 2, 2, 'S');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(m.label, cardX + 3, currentY + 5);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK_PRIMARY);
    doc.text(m.val, cardX + 3, currentY + 12);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(m.sub, cardX + 3, currentY + 17);
  });

  currentY += cardHeight + 8;

  // 3. Section Content based on Report Type
  if (reportType === 'executive' || reportType === 'drainage') {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK_PRIMARY);
    doc.text('1. Drainage Infrastructure Status & Hydraulic Telemetry', 14, currentY);
    currentY += 4;

    const drainageRows = drainageSegments.map((d) => [
      d.id || 'N/A',
      d.name || 'Conduit',
      d.sector || 'Urban Zone',
      `${d.blockagePercent || 0}%`,
      `${d.riskScore || 0}/100`,
      (d.riskLevel || 'healthy').toUpperCase(),
      d.status || 'Active'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['ID', 'Conduit Name', 'Sector / Community', 'Blockage', 'Risk Score', 'Risk Level', 'Status']],
      body: drainageRows.length > 0 ? drainageRows : [
        ['-', 'No drainage conduits recorded', '-', '0%', '0/100', 'NOMINAL', 'Nominal']
      ],
      theme: 'grid',
      headStyles: {
        fillColor: DARK_PRIMARY,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: TEXT_DARK
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  if (reportType === 'executive' || reportType === 'incidents') {
    // Ensure we don't start too close to bottom of page 1
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK_PRIMARY);
    doc.text(
      reportType === 'incidents' ? '1. Incident Monitoring & Citizen Telemetry Feed' : '2. Active Environmental & Blockage Incidents',
      14,
      currentY
    );
    currentY += 4;

    const incidentRows = incidents.slice(0, 10).map((inc) => [
      inc.id || 'N/A',
      inc.title || 'Refuse Accumulation',
      inc.sector || 'District',
      (inc.severity || 'moderate').toUpperCase(),
      inc.reportedBy || 'Citizen',
      (inc.status || 'unresolved').toUpperCase()
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Incident ID', 'Description', 'Sector', 'Severity', 'Reported By', 'Status']],
      body: incidentRows.length > 0 ? incidentRows : [
        ['-', 'No incidents currently recorded', '-', 'NOMINAL', '-', 'RESOLVED']
      ],
      theme: 'grid',
      headStyles: {
        fillColor: PRIMARY_COLOR,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: TEXT_DARK
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  if (reportType === 'users') {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK_PRIMARY);
    doc.text('1. Municipal Personnel Directory & Citizen Contributors', 14, currentY);
    currentY += 4;

    const userRows = usersList.map((u) => [
      u.name || 'User',
      u.email || 'N/A',
      u.role || 'Officer',
      u.department || 'Operations',
      u.status || 'Active',
      String(u.reportsCount || 0)
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Officer / Contributor', 'Email', 'Role', 'Department', 'Status', 'Reports Submitted']],
      body: userRows.length > 0 ? userRows : [
        ['-', 'No users currently registered', '-', '-', '-', '0']
      ],
      theme: 'grid',
      headStyles: {
        fillColor: DARK_PRIMARY,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: TEXT_DARK
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 4. Official Signature & Validation Stamp (Bottom of Page)
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(14, currentY, 196, currentY);
  currentY += 6;

  // Validation note
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    'This official document is generated automatically by the GreenLens Municipal Command Center Platform.',
    14,
    currentY
  );
  doc.text(
    'Data is synchronized in real-time with Open-Meteo Hydrology APIs and Supabase Cloud Telemetry.',
    14,
    currentY + 4
  );

  // Signature Block
  const sigX = 140;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  doc.text('Certified by Command Center:', sigX, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_PRIMARY);
  doc.text(generatedBy, sigX, currentY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`${municipality.name} • Republic of Ghana`, sigX, currentY + 22);

  // Digital Stamp Box
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, currentY + 8, 48, 16, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...DARK_PRIMARY);
  doc.text('DIGITALLY VERIFIED', 20, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('AUTHENTIC MUNICIPAL DISPATCH', 16, currentY + 19);

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `GreenLens Municipal Platform • Page ${i} of ${pageCount} • Confidential Government Property`,
      14,
      290
    );
  }

  // Save the PDF
  const filename = `GreenLens_${reportType.toUpperCase()}_Report_${currentDate.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
  return filename;
};
