import React from "react";
import type { InvoiceData } from "../types";
import { Box, Typography, TextField, Divider } from "@mui/material";

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceData,
  setInvoiceData,
}) => {
  const handleFormChange = (field: keyof InvoiceData["form"], value: any) => {
    setInvoiceData((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        [field]: value,
      },
    }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        請求書詳細
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        自社情報
      </Typography>
      <TextField
        label="名称"
        fullWidth
        margin="normal"
        size="small"
        value={invoiceData.form.company_name || ""}
        onChange={(e) => handleFormChange("company_name", e.target.value)}
      />
      <TextField
        label="住所"
        fullWidth
        margin="normal"
        size="small"
        value={invoiceData.form.company_address || ""}
        onChange={(e) => handleFormChange("company_address", e.target.value)}
      />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        宛先
      </Typography>
      <TextField
        label="名称"
        fullWidth
        margin="normal"
        size="small"
        value={invoiceData.form.recipient_name || ""}
        onChange={(e) => handleFormChange("recipient_name", e.target.value)}
      />
      <TextField
        label="住所"
        fullWidth
        margin="normal"
        size="small"
        value={invoiceData.form.recipient_address || ""}
        onChange={(e) => handleFormChange("recipient_address", e.target.value)}
      />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        請求書情報
      </Typography>
      <TextField
        label="請求書番号"
        fullWidth
        margin="normal"
        size="small"
        value={invoiceData.form.invoice_number || ""}
        onChange={(e) => handleFormChange("invoice_number", e.target.value)}
      />
      <TextField
        label="発行日"
        fullWidth
        margin="normal"
        size="small"
        value={invoiceData.form.issue_date || ""}
        onChange={(e) => handleFormChange("issue_date", e.target.value)}
      />
      <TextField
        label="支払期日"
        fullWidth
        margin="normal"
        size="small"
        value={invoiceData.form.due_date || ""}
        onChange={(e) => handleFormChange("due_date", e.target.value)}
      />
    </Box>
  );
};
