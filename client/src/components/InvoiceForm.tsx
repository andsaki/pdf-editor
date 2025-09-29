import React from "react";
import type { InvoiceData } from "../types";
import { Box } from "@mui/material";

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceData,
  setInvoiceData,
}) => {
  return <Box></Box>;
};
