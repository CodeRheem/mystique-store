// Replace with her actual WhatsApp number, in international format, no + or spaces
// e.g. Nigerian number 0803 123 4567 -> "2348031234567"
export const BUSINESS_WHATSAPP_NUMBER = "2348051353755";

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
    `Hello, I would like to place an order.`,
    `Customer Name: ${customerName}`,
    `Product: ${productName}`,
    selectedOption ? `Selected Option: ${selectedOption}` : null,
  ].filter(Boolean);

  const message = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${message}`;
}

export function buildWhatsAppCartLink({
  customerName,
  items,
  subtotal,
}: {
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    options?: string | null;
  }>;
  subtotal: number;
}) {
  const lines = [
    `Hello, I would like to place an order for the following items:`,
    `Customer Name: ${customerName}`,
    ...items.map((item) => {
      const optionText = item.options ? ` (${item.options})` : "";
      const lineTotal = item.price * item.quantity;
      return `- ${item.name}${optionText} | Qty: ${item.quantity} | Unit Price: ₦${item.price.toLocaleString()} | Total: ₦${lineTotal.toLocaleString()}`;
    }),
    `Subtotal: ₦${subtotal.toLocaleString()}`,
    `Please confirm availability and delivery details.`,
  ];

  const message = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${message}`;
}