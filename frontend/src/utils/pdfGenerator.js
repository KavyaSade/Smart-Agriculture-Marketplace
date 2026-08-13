import { jsPDF } from 'jspdf';
import logoUrl from '../assets/logo-banner.png';

// Helper to convert logo URL to base64 data URL
const getLogoBase64 = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;
        
        let minX = img.width;
        let maxX = 0;
        let minY = img.height;
        let maxY = 0;
        
       
        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            const index = (y * img.width + x) * 4;
            const alpha = data[index + 3];
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            
            const isWhite = r > 248 && g > 248 && b > 248;
            const isTransparent = alpha < 10;
            
            if (!isTransparent && !isWhite) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        
        
        minX = Math.max(0, minX - 2);
        maxX = Math.min(img.width - 1, maxX + 2);
        minY = Math.max(0, minY - 2);
        maxY = Math.min(img.height - 1, maxY + 2);
        
        const cropWidth = maxX - minX;
        const cropHeight = maxY - minY;
        
        if (cropWidth <= 0 || cropHeight <= 0) {
          // Fallback to original image if no content found
          resolve({
            dataUrl: canvas.toDataURL('image/png'),
            aspectRatio: img.width / img.height
          });
          return;
        }
        
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.drawImage(img, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        
        resolve({
          dataUrl: croppedCanvas.toDataURL('image/png'),
          aspectRatio: cropWidth / cropHeight
        });
      } catch (err) {
        console.error('Error cropping logo image:', err);
        resolve(null);
      }
    };
    img.onerror = (err) => {
      console.error('Failed to load logo image:', err);
      resolve(null);
    };
  });
};

// Generic PDF Drawer
const drawLegalPDF = async (filename, title, effectiveDate, contentItems) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginTop = 30;
  const marginBottom = 25;
  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  
  let currentY = marginTop;
  
  // Load Logo
  const logoResult = await getLogoBase64();
  const logoData = logoResult ? logoResult.dataUrl : null;
  const logoRatio = logoResult ? logoResult.aspectRatio : 2.77;
  
  // Draw Cover
  // 1. Top Color Bar
  doc.setFillColor(27, 67, 50); 
  doc.rect(marginLeft, 18, contentWidth, 3, 'F');
  
  // 2. Left Column:Logo
  if (logoData) {
    const finalHeight = Math.min(32, 75 / logoRatio);
    const finalWidth = finalHeight * logoRatio;
    const yOffset = 22 + (36 - finalHeight) / 2;
    doc.addImage(logoData, 'PNG', marginLeft, yOffset, finalWidth, finalHeight);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(27, 67, 50);
    doc.text('AgriMarket', marginLeft, 38);
  }

  // 3. Right Column: Document Metadata & Company Address
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(27, 67, 50);
  doc.text(title.toUpperCase(), pageWidth - marginRight, 28, { align: 'right' });

  const labelX = pageWidth - marginRight - 43;
  const drawMetaRow = (label, val, yPos) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 67, 50);
    doc.setFontSize(8);
    doc.text(label, labelX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(85, 98, 91);
    doc.setFontSize(8);
    doc.text(val, pageWidth - marginRight, yPos, { align: 'right' });
  };

  const docId = title === 'Privacy Policy' ? 'AM-PP-2026-V1' : 'AM-TS-2026-V1';

  drawMetaRow('Document ID:', docId, 34);
  drawMetaRow('Effective Date:', effectiveDate, 38);
  drawMetaRow('Classification:', 'Official / Public', 42);

  // Right Column, Company Credentials
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(27, 67, 50);
  doc.text('AgriMarket', pageWidth - marginRight, 48, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(85, 98, 91);
  doc.text('Eluru District, Andhra Pradesh, India', pageWidth - marginRight, 52, { align: 'right' });
  doc.text('Email: support@agrimarket.com', pageWidth - marginRight, 55, { align: 'right' });
  doc.text('Web: www.agrimarket.com', pageWidth - marginRight, 58, { align: 'right' });

  // 4. Separator Line
  doc.setDrawColor(64, 145, 108); // #40916c
  doc.setLineWidth(0.5);
  doc.line(marginLeft, 62, pageWidth - marginRight, 62);

  currentY = 68;

  // Process all items and add page breaks as needed
  for (const item of contentItems) {
    if (item.type === 'heading') {
      doc.setFont('helvetica', 'bold');
      const fontSize = 13;
      doc.setFontSize(fontSize);
      doc.setTextColor(27, 67, 50); // #1b4332

      const text = item.text;
      const lines = doc.splitTextToSize(text, contentWidth);
      const lineHeight = fontSize * 0.352778 * 1.4;
      const blockHeight = 8 + (lines.length * lineHeight) + 4;

      if (currentY + blockHeight > pageHeight - marginBottom) {
        doc.addPage();
        currentY = marginTop;
      } else {
        currentY += 6;
      }

      for (const line of lines) {
        doc.text(line, marginLeft, currentY + (fontSize * 0.352778));
        currentY += lineHeight;
      }
      currentY += 2;

    } else if (item.type === 'subheading') {
      doc.setFont('helvetica', 'bold');
      const fontSize = 11;
      doc.setFontSize(fontSize);
      doc.setTextColor(45, 106, 79); // #2d6a4f

      const text = item.text;
      const lines = doc.splitTextToSize(text, contentWidth);
      const lineHeight = fontSize * 0.352778 * 1.4;
      const blockHeight = 6 + (lines.length * lineHeight) + 3;

      if (currentY + blockHeight > pageHeight - marginBottom) {
        doc.addPage();
        currentY = marginTop;
      } else {
        currentY += 4;
      }

      for (const line of lines) {
        doc.text(line, marginLeft, currentY + (fontSize * 0.352778));
        currentY += lineHeight;
      }
      currentY += 2;

    } else if (item.type === 'paragraph') {
      doc.setFont('helvetica', 'normal');
      const fontSize = 10;
      doc.setFontSize(fontSize);
      doc.setTextColor(28, 36, 32); // #1c2420

      const text = item.text;
      const lines = doc.splitTextToSize(text, contentWidth);
      const lineHeight = fontSize * 0.352778 * 1.5; // nice readable paragraph spacing
      const blockHeight = 2 + (lines.length * lineHeight) + 3;

      if (currentY + blockHeight > pageHeight - marginBottom) {
        doc.addPage();
        currentY = marginTop;
      } else {
        currentY += 1;
      }

      for (const line of lines) {
        doc.text(line, marginLeft, currentY + (fontSize * 0.352778));
        currentY += lineHeight;
      }
      currentY += 2;

    } else if (item.type === 'list') {
      const fontSize = 10;
      const bulletIndent = 6;
      const listWidth = contentWidth - bulletIndent;

      for (const listItem of item.items) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(28, 36, 32); // #1c2420

        const lines = doc.splitTextToSize(listItem, listWidth);
        const lineHeight = fontSize * 0.352778 * 1.5;
        const blockHeight = 1 + (lines.length * lineHeight) + 2;

        if (currentY + blockHeight > pageHeight - marginBottom) {
          doc.addPage();
          currentY = marginTop;
        } else {
          currentY += 1;
        }

        // Draw bullet point
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 106, 79); // Accent bullet color
        doc.text('•', marginLeft + 2, currentY + (fontSize * 0.352778));

        // Draw list text
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(28, 36, 32);
        for (const line of lines) {
          doc.text(line, marginLeft + bulletIndent, currentY + (fontSize * 0.352778));
          currentY += lineHeight;
        }
        currentY += 1.5;
      }
      currentY += 2;
    }
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(85, 98, 91); 
      doc.text(`AgriMarket - ${title}`, marginLeft, 12);

      // Top header line
      doc.setDrawColor(64, 145, 108, 0.3); 
      doc.setLineWidth(0.3);
      doc.line(marginLeft, 15, pageWidth - marginRight, 15);
    }

    // Footer on all pages
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, pageHeight - 15, pageWidth - marginRight, pageHeight - 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(85, 98, 91);
    doc.text('AgriMarket Legal Document - Confidential', marginLeft, pageHeight - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginRight, pageHeight - 10, { align: 'right' });
  }

  // Save the PDF
  doc.save(filename);
};


// PRIVACY POLICY CONTENT

const getPrivacyPolicyContent = () => [
  { type: 'paragraph', text: 'Welcome to AgriMarket. AgriMarket ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy describes how we collect, use, disclose, and safeguard your personal information when you use our website, mobile application, and Digital Smart Agriculture Marketplace services.' },

  { type: 'heading', text: '1. Information We Collect' },
  { type: 'paragraph', text: 'We collect information from you when you visit our platform, register an account, list products, make purchases, or otherwise interact with our services. The types of information we collect include:' },

  { type: 'subheading', text: '1.1 Personal Information' },
  { type: 'paragraph', text: 'We collect personal information that can identify you directly, such as your full name, email address, physical shipping address, billing address, phone number, and official government identification documents (for farmer verification purposes).' },

  { type: 'subheading', text: '1.2 Account Information' },
  { type: 'paragraph', text: 'When you create an account, we store credentials such as your username, password hash, role classification (Farmer, Buyer, Retailer, or Admin), and preferences.' },

  { type: 'subheading', text: '1.3 Farmer and Buyer Information' },
  { type: 'paragraph', text: 'For farmers, we collect farm locations, size of land, crops cultivated, bank account details for direct payments, and agricultural certifications. For buyers and retailers, we collect delivery preferences, purchasing history, and business registrations.' },

  { type: 'subheading', text: '1.4 Product and Transaction Information' },
  { type: 'paragraph', text: 'We collect details about the products you list, view, add to cart, or purchase. This includes product category (e.g., grains, vegetables, fruits, dairy), quantity, pricing, transaction dates, and buyer-seller correspondence.' },

  { type: 'subheading', text: '1.5 Payment Information' },
  { type: 'paragraph', text: 'We collect transaction metadata, invoice records, and billing details. Payment processing is facilitated securely via verified third-party payment gateways; we do not store full credit/debit card numbers on our servers.' },

  { type: 'subheading', text: '1.6 Location Information' },
  { type: 'paragraph', text: 'With your consent, we collect precise or approximate geolocation data from your device to help list local produce, calculate transportation and delivery costs, and map logistics.' },

  { type: 'subheading', text: '1.7 Device and Usage Information' },
  { type: 'paragraph', text: 'We automatically log technical data, including your IP address, browser type, device details, operating system, pages visited before and after entering AgriMarket, and usage patterns.' },

  { type: 'heading', text: '2. How We Use Information' },
  { type: 'paragraph', text: 'We use the collected information for various professional and operational purposes:' },
  {
    type: 'list', items: [
      'Facilitating buyer-seller matching and processing agricultural transactions.',
      'Verifying farmer identity and authenticity of crop listings.',
      'Processing payments and coordinating shipping/logistics.',
      'Providing customer support, resolving disputes, and executing refunds.',
      'Optimizing website functionality, search algorithms, and recommendation engines.',
      'Sending system alerts, transactional notifications, and marketing communications.',
      'Preventing fraud, enforcing our terms, and complying with local agricultural laws.'
    ]
  },

  { type: 'heading', text: '3. How We Share Information' },
  { type: 'paragraph', text: 'We do not sell your personal data. We share your information in the following limited circumstances:' },
  {
    type: 'list', items: [
      'With other marketplace participants (e.g., sharing a buyer\'s address with a shipping provider or a farmer to complete delivery).',
      'With service providers who assist in payment processing, data analytics, hosting, and marketing.'
    ]
  },

  { type: 'subheading', text: '3.1 Payment and Third-Party Services' },
  { type: 'paragraph', text: 'We integrate with verified payment gateways (e.g., Stripe, Razorpay) and SMS/email service providers. These third parties access data only as required to perform their specific functions.' },

  { type: 'heading', text: '4. Cookies and Tracking Technologies' },
  { type: 'paragraph', text: 'We use cookies, web beacons, and similar tracking technologies to store your preferences, keep you logged in, analyze site traffic, and personalize your experience. You can manage cookies in your browser settings.' },

  { type: 'heading', text: '5. Data Security' },
  { type: 'paragraph', text: 'We implement industry-standard security measures, including HTTPS encryption, secure database hashing, and token-based authentication (JWT), to protect your personal information. However, no electronic transmission or storage is 100% secure.' },

  { type: 'heading', text: '6. Data Retention' },
  { type: 'paragraph', text: 'We retain your personal data only as long as necessary to fulfill the purposes outlined in this policy, satisfy legal/tax obligations, or resolve outstanding disputes.' },

  { type: 'heading', text: '7. User Rights' },
  { type: 'paragraph', text: 'You have the right to access, update, correct, or request the deletion of your personal data at any time through your profile settings or by contacting support.' },

  { type: 'subheading', text: '7.1 Account Deletion' },
  { type: 'paragraph', text: 'If you choose to delete your account, we will erase or anonymize your personal information from our active databases, subject to any legal retention requirements for transactions and invoices.' },

  { type: 'heading', text: '8. Children\'s Privacy' },
  { type: 'paragraph', text: 'AgriMarket does not target or knowingly collect data from children under the age of 18. If we discover we have inadvertently collected such data, we will delete it immediately.' },

  { type: 'heading', text: '9. Third-Party Links' },
  { type: 'paragraph', text: 'Our website may contain links to external sites (e.g., transport providers or weather services). We are not responsible for the privacy practices of external third-party platforms.' },

  { type: 'heading', text: '10. Changes to This Privacy Policy' },
  { type: 'paragraph', text: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on this page and updating the "Effective Date" at the top.' },

  { type: 'heading', text: '11. Contact Information' },
  { type: 'paragraph', text: 'If you have questions or concerns about this Privacy Policy, please contact us at:' },
  {
    type: 'list', items: [
      'Email Support: support@agrimarket.com, kavya@shnoor.com, rishi@shnoor.com',
      'Address: AgriMarket Headquarters, Eluru District, Andhra Pradesh, India',
      'Phone: +91 98765 43210'
    ]
  }
];

// TERMS OF SERVICE CONTENT
const getTermsOfServiceContent = () => [
  { type: 'paragraph', text: 'Welcome to AgriMarket. These Terms of Service ("Terms") govern your access to and use of the AgriMarket platform, including our website, mobile application, and MERN-based Smart Agriculture Marketplace services.' },

  { type: 'heading', text: '1. Acceptance of Terms' },
  { type: 'paragraph', text: 'By registering, accessing, browsing, or using AgriMarket, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not access or use the platform.' },

  { type: 'heading', text: '2. Eligibility' },
  { type: 'paragraph', text: 'You must be at least 18 years of age and capable of forming legally binding contracts under applicable laws to use AgriMarket. By registering, you warrant that you meet these eligibility criteria.' },

  { type: 'heading', text: '3. Account Registration' },
  { type: 'paragraph', text: 'To list or purchase agricultural products, you must register for an account. You agree to provide accurate, current, and complete information and maintain the confidentiality of your account credentials. You are responsible for all actions taken under your account.' },

  { type: 'heading', text: '4. Farmer Responsibilities' },
  { type: 'paragraph', text: 'Farmers listing products on the platform agree to the following terms:' },
  {
    type: 'list', items: [
      'Provide accurate product details, including weight, quality grade, harvest date, and organic status.',
      'Abide by local agricultural rules, quality standards, and safety guidelines.',
      'Guarantee that listed produce is legally owned and free from liens or contamination.',
      'Keep stock availability updated to prevent unfulfillable orders.'
    ]
  },

  { type: 'heading', text: '5. Buyer Responsibilities' },
  { type: 'paragraph', text: 'Buyers and Retailers placing orders on the platform agree to:' },
  {
    type: 'list', items: [
      'Review product specifications, pricing, and shipping terms prior to placing an order.',
      'Provide accurate billing, contact, and physical delivery addresses.',
      'Complete payment for all confirmed orders in a timely manner.',
      'Accept delivery within scheduled timelines or pay additional restocking/logistics fees.'
    ]
  },

  { type: 'heading', text: '6. Product Listings' },
  { type: 'paragraph', text: 'All listings must correspond to genuine agricultural commodities (crops, vegetables, fruits, grains, seeds, dairy). Listings containing prohibited items or misrepresenting quality will be removed.' },

  { type: 'heading', text: '7. Product Pricing' },
  { type: 'paragraph', text: 'Prices are set by the selling Farmers. Prices may change due to seasonal supply and demand, and must include all applicable taxes. Shipping or delivery charges will be calculated and shown separately at checkout.' },

  { type: 'heading', text: '8. Orders and Transactions' },
  { type: 'paragraph', text: 'An order constitutes an offer to buy. A transaction is finalized when the selling Farmer accepts the order and payment authorization is successfully processed.' },

  { type: 'heading', text: '9. Payments' },
  { type: 'paragraph', text: 'We use third-party payment processors to handle payment checkout. Payments are held in escrow or routed directly to the seller upon confirmation of dispatch or delivery, depending on the transaction flow.' },

  { type: 'heading', text: '10. Shipping and Delivery' },
  { type: 'paragraph', text: 'Sellers and buyers can coordinate logistics directly or use AgriMarket\'s integrated logistics partners. Risk of loss passes to the buyer upon receipt/delivery confirmation.' },

  { type: 'heading', text: '11. Cancellations and Refunds' },
  { type: 'paragraph', text: 'Cancellations must be requested before order dispatch. Refunds are governed by our Refund Policy, and are generally issued only if the goods delivered do not match the listing specifications or are damaged during transport.' },

  { type: 'heading', text: '12. Product Reviews and Ratings' },
  { type: 'paragraph', text: 'Users may write reviews and rate transactions. Reviews must be honest, respectful, and free of promotional or offensive content. We reserve the right to remove non-compliant reviews.' },

  { type: 'heading', text: '13. Prohibited Activities' },
  { type: 'paragraph', text: 'You agree not to engage in any of the following prohibited behaviors:' },
  {
    type: 'list', items: [
      'Posting false, misleading, or fraudulent product listings.',
      'Bypassing AgriMarket\'s payment systems to conduct offline transactions.',
      'Interfering with platform security, injecting malware, or scraping data.',
      'Harassing, threatening, or defrauding other marketplace participants.'
    ]
  },

  { type: 'heading', text: '14. Intellectual Property' },
  { type: 'paragraph', text: 'All content on AgriMarket (logo, design, software, text, graphics, icons) is the exclusive property of AgriMarket or its licensors and is protected by copyright and intellectual property laws.' },

  { type: 'heading', text: '15. Marketplace Role and Limitations' },
  { type: 'paragraph', text: 'AgriMarket operates as an online marketplace connecting farmers and buyers. We do not inspect every crop physically and are not a party to the direct contract between buyers and sellers, except where specified.' },

  { type: 'heading', text: '16. Third-Party Services' },
  { type: 'paragraph', text: 'We may link to or integrate third-party services (e.g., mapping, weather, logistics). We do not guarantee or assume liability for third-party operations.' },

  { type: 'heading', text: '17. Account Suspension and Termination' },
  { type: 'paragraph', text: 'We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent behavior, or disrupt the platform ecosystem.' },

  { type: 'heading', text: '18. Limitation of Liability' },
  { type: 'paragraph', text: 'To the maximum extent permitted by law, AgriMarket shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenue.' },

  { type: 'heading', text: '19. Disclaimer' },
  { type: 'paragraph', text: 'The marketplace is provided on an "as is" and "as available" basis. We disclaim all warranties of any kind, whether express or implied, including merchantability and fitness for a particular purpose.' },

  { type: 'heading', text: '20. Dispute Resolution' },
  { type: 'paragraph', text: 'Any disputes arising out of these Terms shall be resolved through good-faith negotiations. If unresolved, they shall be referred to arbitration in Andhra Pradesh, India, in accordance with the Arbitration and Conciliation Act.' },

  { type: 'heading', text: '21. Changes to Terms' },
  { type: 'paragraph', text: 'We reserve the right to modify these Terms at any time. We will post the revised terms on the platform and update the "Effective Date". Continued use of the platform constitutes acceptance of the new Terms.' },

  { type: 'heading', text: '22. Contact Information' },
  { type: 'paragraph', text: 'For questions regarding these Terms, please contact us at:' },
  {
    type: 'list', items: [
      'Legal Team: legal@agrimarket.com, kavya@shnoor.com, rishi@shnoor.com',
      'Address: AgriMarket Headquarters, Eluru District, Andhra Pradesh, India',
      'Phone: +91 98765 43210'
    ]
  }
];


// EXPORTS
export const generatePrivacyPolicyPDF = async () => {
  await drawLegalPDF(
    'AgriMarket-Privacy-Policy.pdf',
    'Privacy Policy',
    'August 13, 2026',
    getPrivacyPolicyContent()
  );
};

export const generateTermsOfServicePDF = async () => {
  await drawLegalPDF(
    'AgriMarket-Terms-of-Service.pdf',
    'Terms of Service',
    'August 13, 2026',
    getTermsOfServiceContent()
  );
};

