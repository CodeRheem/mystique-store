// Replace with her actual WhatsApp number, in international format, no + or spaces
// e.g. Nigerian number 0803 123 4567 -> "2348031234567"
export const BUSINESS_WHATSAPP_NUMBER = "2348000000000";

export function buildWhatsAppOrderLink({
  customerName,
  productName,
  selectedOption,
}: {
  customerName: string;
  productName: string;
  selectedOption?: string;
}) {
  const lines = [
    `Hi! I'd like to order:`,
    `Item: ${productName}`,
    selectedOption ? `Option: ${selectedOption}` : null,
    `Name: ${customerName}`,
  ].filter(Boolean);

  const message = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${message}`;
}