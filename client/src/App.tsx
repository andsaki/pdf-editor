import { useState, useRef, useMemo } from "react";
import {
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  createTheme,
  ThemeProvider,
  Divider,
} from "@mui/material";
import { PdfPreview } from "./components/PdfPreview";
import type {
  InvoiceData,
  LayoutItem,
  TableCell,
  TableItem,
} from "./utils/types";
import { pdf } from "@react-pdf/renderer";
import { InvoiceDocument } from "./components/InvoiceDocument";
import { LayoutPalette } from "./components/LayoutPalette";
import { LayerPalette } from "./components/LayerPalette";
import { useHistoryState } from "./hooks/useHistoryState";
import { useQuery, useMutation, gql } from "@apollo/client";
import { LeftToolbar } from "./components/LeftToolbar";
import { pdfjs } from "react-pdf";
import { ShapeCreationPalette } from "./components/ShapeCreationPalette";
import { StatePreview } from "./components/StatePreview";
import { TextObjectPalette } from "./components/TextObjectPalette";

const SAVE_INVOICE_MUTATION = gql`
  mutation SaveInvoice($invoiceData: InvoiceDataInput!) {
    saveInvoice(invoiceData: $invoiceData)
  }
`;

const GENERATE_PDF_MUTATION = gql`
  mutation GeneratePdf($html: String!) {
    generatePdf(html: $html)
  }
`;

const GET_COMPANY_INFO = gql`
  query GetCompanyInfo {
    getCompanyInfo {
      name {
        label
        value
      }
      zip {
        label
        value
      }
      prefecture {
        label
        value
      }
      city {
        label
        value
      }
      street {
        label
        value
      }
      building {
        label
        value
      }
      tel {
        label
        value
      }
      fax {
        label
        value
      }
      email {
        label
        value
      }
      contact_person {
        label
        value
      }
      registration_number {
        label
        value
      }
      payment_due_date {
        label
        value
      }
      bank_account {
        label
        value
      }
    }
  }
`;

const GET_INVOICE = gql`
  query GetInvoice($id: ID!) {
    getInvoice(id: $id) {
      layout {
        id
        type
        x
        y
        width
        height
        zIndex
        locked
        visible
        content
        contentType
        label
        src
        data {
          id
          content
          contentType
          label
          style {
            fontFamily
            fontSize
            bold
            italic
          }
        }
        shapeType
        style {
          fontFamily
          fontSize
          lineHeight
          textAlign
          verticalAlign
          color
          bold
          italic
          wordWrap
          backgroundColor
          textShadow
          isBullet
        }
      }
      form {
        issue_date {
          value
          label
        }
        due_date {
          value
          label
        }
        invoice_number {
          value
          label
        }
        recipient_name {
          value
          label
        }
        recipient_title {
          value
          label
        }
        recipient_zip {
          value
          label
        }
        recipient_prefecture {
          value
          label
        }
        recipient_city {
          value
          label
        }
        recipient_street {
          value
          label
        }
        recipient_building {
          value
          label
        }
        recipient_tel {
          value
          label
        }
        recipient_email {
          value
          label
        }
        recipient_department_name {
          value
          label
        }
        recipient_contact_name {
          value
          label
        }
        subtotal {
          value
          label
        }
        tax {
          value
          label
        }
        total {
          value
          label
        }
        line_items {
          name {
            value
            label
          }
          date {
            value
            label
          }
          quantity {
            value
            label
          }
          unit_price {
            value
            label
          }
          amount {
            value
            label
          }
        }
      }
    }
  }
`;

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  const {
    state: layout,
    setState: setLayout,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistoryState<LayoutItem[]>([]);
  const [form, setForm] = useState<InvoiceData["form"]>({});
  const invoiceData: InvoiceData = useMemo(
    () => ({ layout, form }),
    [layout, form]
  );
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{
    tableId: string;
    rowIndex: number;
    cellIndex: number;
  } | null>(null);
  const [clipboard, setClipboard] = useState<LayoutItem | null>(null);
  const [variableDisplayMode, setVariableDisplayMode] = useState<
    "name" | "example"
  >("example");
  const [activeRightPanel, setActiveRightPanel] = useState<
    "properties" | "layers"
  >("properties");
  const [activeCreationPalette, setActiveCreationPalette] = useState<
    "shape" | null
  >(null);
  const [showStatePreview, setShowStatePreview] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [saveInvoiceMutation] = useMutation(SAVE_INVOICE_MUTATION);
  const [generatePdfMutation] = useMutation(GENERATE_PDF_MUTATION);
  const { data: companyInfoData } = useQuery(GET_COMPANY_INFO);
  useQuery(GET_INVOICE, {
    variables: { id: "1" },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      console.log("data", data);
      if (data && data.getInvoice) {
        setLayout(data.getInvoice.layout);
        setForm(data.getInvoice.form);
      }
    },
    onError: (error) => {
      console.error("Error fetching invoice:", error);
    },
  });

  const getNewZIndex = () => {
    if (layout.length === 0) return 1;
    const maxZIndex = layout.reduce(
      (max, item) => Math.max(max, item.zIndex),
      0
    );
    return maxZIndex + 1;
  };

  const toggleLayersPanel = () => {
    setActiveRightPanel((prev) =>
      prev === "layers" ? "properties" : "layers"
    );
  };

  const handleSelectObject = (objectId: string | null) => {
    setSelectedObjectId(objectId);
    if (objectId) {
      setActiveRightPanel("properties");
      setSelectedCell(null); // Deselect cell when an object is selected
    }
  };

  const handleSelectCell = (
    selection: { tableId: string; rowIndex: number; cellIndex: number } | null
  ) => {
    setSelectedCell(selection);
    if (selection) {
      setSelectedObjectId(null); // Deselect object when a cell is selected
      setActiveRightPanel("properties");
    }
  };

  const handleCellUpdate = (update: Partial<TableCell>) => {
    if (!selectedCell) return;
    const { tableId, rowIndex, cellIndex } = selectedCell;

    setLayout((prevLayout) => {
      return prevLayout.map((item) => {
        if (item.id === tableId && item.type === "table") {
          const newTableItem = JSON.parse(JSON.stringify(item)) as TableItem;
          const cellToUpdate = newTableItem.data[rowIndex][cellIndex];
          Object.assign(cellToUpdate, update);
          return newTableItem;
        }
        return item;
      });
    });
  };

  const addTextObject = () => {
    const newText: LayoutItem = {
      id: crypto.randomUUID(),
      type: "text",
      contentType: "fixed",
      content: "テキスト",
      x: 100,
      y: 100,
      width: 150,
      height: 20,
      zIndex: getNewZIndex(),
      style: { isBullet: false, lineHeight: 1.2 },
    };
    setLayout((prevLayout) => [...(prevLayout || []), newText]);
    handleSelectObject(newText.id);
  };

  const addTableObject = () => {
    const createCell = (content: string): TableCell => ({
      id: crypto.randomUUID(),
      content,
      contentType: "fixed",
      style: {},
    });

    const newTable: LayoutItem = {
      id: crypto.randomUUID(),
      type: "table",
      x: 100,
      y: 200,
      width: 300,
      height: 100,
      data: [
        [createCell("Header 1"), createCell("Header 2")],
        [createCell("Cell 1"), createCell("Cell 2")],
      ],
      zIndex: getNewZIndex(),
    };
    setLayout((prevLayout) => [...(prevLayout || []), newTable]);
    handleSelectObject(newTable.id);
  };

  const addBulletObject = () => {
    const newBullet: LayoutItem = {
      id: crypto.randomUUID(),
      type: "text",
      contentType: "fixed",
      content: "項目1\n項目2\n項目3",
      x: 100,
      y: 100,
      width: 150,
      height: 60,
      zIndex: getNewZIndex(),
      style: { isBullet: true, lineHeight: 1.5 },
    };
    setLayout((prevLayout) => [...(prevLayout || []), newBullet]);
    handleSelectObject(newBullet.id);
  };

  const addShapeObject = (shapeType: "rect" | "h-line" | "v-line") => {
    const baseShape = {
      id: crypto.randomUUID(),
      type: "shape" as const,
      shapeType: shapeType,
      x: 100,
      y: 100,
      zIndex: getNewZIndex(),
    };

    let newShape: LayoutItem;
    if (shapeType === "h-line") {
      newShape = {
        ...baseShape,
        width: 200,
        height: 2,
        style: { backgroundColor: "#000000" },
      };
    } else if (shapeType === "v-line") {
      newShape = {
        ...baseShape,
        width: 2,
        height: 100,
        style: { backgroundColor: "#000000" },
      };
    } else {
      // rect
      newShape = {
        ...baseShape,
        width: 150,
        height: 100,
        style: { backgroundColor: "#cccccc" },
      };
    }

    setLayout((prevLayout) => [...(prevLayout || []), newShape]);
    handleSelectObject(newShape.id);
    setActiveCreationPalette(null);
  };

  const deleteSelectedObject = () => {
    if (!selectedObjectId) return;
    setLayout((prevLayout) =>
      prevLayout.filter((item) => item.id !== selectedObjectId)
    );
    handleSelectObject(null);
  };

  const cut = () => {
    if (!selectedObjectId) return;
    const objectToCut = layout.find((item) => item.id === selectedObjectId);
    if (objectToCut) {
      setClipboard(objectToCut);
      setLayout((prevLayout) =>
        prevLayout.filter((item) => item.id !== selectedObjectId)
      );
      handleSelectObject(null);
    }
  };

  const paste = () => {
    if (!clipboard) return;
    const newObject: LayoutItem = {
      ...clipboard,
      id: crypto.randomUUID(),
      x: clipboard.x + 10,
      y: clipboard.y + 10,
    };
    setLayout((prevLayout) => [...prevLayout, newObject]);
  };

  const moveLayer = (direction: "up" | "down") => {
    if (!selectedObjectId) return;

    const sortedLayout = [...layout].sort((a, b) => a.zIndex - b.zIndex);
    const currentIndex = sortedLayout.findIndex(
      (item) => item.id === selectedObjectId
    );

    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up" ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex < 0 || targetIndex >= sortedLayout.length) return;

    const currentItem = sortedLayout[currentIndex];
    const targetItem = sortedLayout[targetIndex];

    setLayout((prevLayout) => {
      return prevLayout.map((item) => {
        if (item.id === currentItem.id) {
          return { ...item, zIndex: targetItem.zIndex };
        }
        if (item.id === targetItem.id) {
          return { ...item, zIndex: currentItem.zIndex };
        }
        return item;
      });
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      if (data) {
        const img = new Image();
        img.onload = () => {
          const newImage: LayoutItem = {
            id: crypto.randomUUID(),
            type: "image",
            src: data,
            x: 50,
            y: 50,
            width: img.width,
            height: img.height,
            zIndex: getNewZIndex(),
          };
          setLayout((prevLayout) => [...(prevLayout || []), newImage]);
        };
        img.src = data;
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result as ArrayBuffer;
      if (data) {
        const pdf = await pdfjs.getDocument({ data }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            const imageDataUrl = canvas.toDataURL("image/png");
            const newImage: LayoutItem = {
              id: crypto.randomUUID(),
              type: "image" as const,
              src: imageDataUrl,
              x: 50,
              y: 50 + (i - 1) * (viewport.height + 20),
              width: viewport.width,
              height: viewport.height,
              zIndex: getNewZIndex(),
            };
            setLayout((prevLayout) => [...(prevLayout || []), newImage]);
          }
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const saveInvoice = async () => {
    try {
      // Remove __typename fields that Apollo Client adds
      const cleanData = JSON.parse(
        JSON.stringify(invoiceData, (key, value) =>
          key === "__typename" ? undefined : value
        )
      );
      console.log("Attempting to save invoice data:", cleanData);
      await saveInvoiceMutation({
        variables: {
          invoiceData: cleanData,
        },
      });
      alert("Invoice saved successfully!");
    } catch (e: any) {
      console.error("Error saving invoice:", e);
      console.error("GraphQL errors:", e.graphQLErrors);
      console.error("Network error:", e.networkError);
      const errorMessage = e.graphQLErrors?.[0]?.message || e.networkError?.message || e.message || "Unknown error";
      alert(`An error occurred while saving the invoice: ${errorMessage}`);
    }
  };

  const openPdfInNewTab = async () => {
    const blob = await pdf(
      <InvoiceDocument
        invoiceData={invoiceData}
        companyInfo={companyInfoData?.getCompanyInfo}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  const openPdfWithPuppeteer = async () => {
    try {
      console.log("Starting Puppeteer PDF generation...");
      // Generate HTML from current layout
      const htmlContent = generateHtmlFromLayout(invoiceData, companyInfoData?.getCompanyInfo);
      console.log("Generated HTML:", htmlContent);

      const result = await generatePdfMutation({
        variables: { html: htmlContent },
      });

      console.log("Mutation result:", result);

      if (result.data?.generatePdf) {
        // Convert base64 to blob
        const base64 = result.data.generatePdf;
        console.log("Received base64 PDF, length:", base64.length);
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        console.log("Opening PDF URL:", url);
        window.open(url);
      } else {
        console.error("No PDF data in result:", result);
        alert("PDF生成に失敗しました: データが返されませんでした");
      }
    } catch (e: any) {
      console.error("Error generating PDF:", e);
      console.error("Error details:", e.graphQLErrors, e.networkError);
      alert(`PDF生成に失敗しました: ${e.message}`);
    }
  };

  const generateHtmlFromLayout = (data: InvoiceData, companyInfo?: any): string => {
    // Generate a simple HTML representation of the invoice
    const itemsHtml = data.layout
      .filter(item => item.visible !== false)
      .map(item => {
        if (item.type === 'text') {
          return `<div class="item" style="left: ${item.x}px; top: ${item.y}px; width: ${item.width}px; height: ${item.height}px; font-size: ${item.style?.fontSize || 16}px; color: ${item.style?.color || 'black'};">${item.content}</div>`;
        }
        return '';
      })
      .join('');

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: "BIZ UDPGothic", "Hiragino Sans", sans-serif; }
      .page { width: 210mm; height: 297mm; position: relative; background: white; }
      .item { position: absolute; }
    </style>
  </head>
  <body>
    <div class="page">
      ${itemsHtml}
    </div>
  </body>
</html>`;
  };

  const selectedObject = layout.find((obj) => obj.id === selectedObjectId);

  const selectedCellObject = useMemo(() => {
    if (!selectedCell) return null;
    const { tableId, rowIndex, cellIndex } = selectedCell;
    const table =
      (layout.find(
        (item) => item.id === tableId && item.type === "table"
      ) as TableItem) || null;
    return table?.data[rowIndex]?.[cellIndex] || null;
  }, [selectedCell, layout]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" sx={{ fontWeight: "bold", mr: 2 }}>
              Invoice Editor
            </Typography>
            <Button onClick={undo} disabled={!canUndo} size="small">
              元に戻す
            </Button>
            <Button onClick={redo} disabled={!canRedo} size="small">
              やり直し
            </Button>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Button onClick={cut} disabled={!selectedObjectId} size="small">
              切り取り
            </Button>
            <Button onClick={paste} disabled={!clipboard} size="small">
              貼り付け
            </Button>
            <Button
              onClick={deleteSelectedObject}
              disabled={!selectedObjectId}
              size="small"
              color="error"
            >
              削除
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                setVariableDisplayMode((prev) =>
                  prev === "name" ? "example" : "name"
                )
              }
            >
              {variableDisplayMode === "name" ? "データ例で表示" : "変数で表示"}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={openPdfInNewTab}
              sx={{ ml: 1 }}
            >
              プレビュー (React-PDF)
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={openPdfWithPuppeteer}
              sx={{ ml: 1 }}
            >
              プレビュー (Puppeteer)
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => alert("PDFトレース機能は未実装です")}
              sx={{ ml: 1 }}
            >
              PDFをトレース
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowStatePreview((prev) => !prev)}
              sx={{ ml: 1 }}
            >
              State Preview
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button>キャンセル</Button>
            <Button variant="contained" onClick={saveInvoice} sx={{ ml: 1 }}>
              保存
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Box
            sx={{
              position: "relative",
              display: "flex",
            }}
          >
            <Box
              component="aside"
              sx={{
                width: 64,
                bgcolor: "background.paper",
                p: 1,
                borderRight: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <LeftToolbar
                onAddText={addTextObject}
                onAddBullet={addBulletObject}
                onAddTable={addTableObject}
                onAddShape={() =>
                  setActiveCreationPalette((prev) =>
                    prev === "shape" ? null : "shape"
                  )
                }
                onAddImage={() => imageInputRef.current?.click()}
                onAddPdf={() => pdfInputRef.current?.click()}
                onToggleLayers={toggleLayersPanel}
              />
            </Box>
            {activeCreationPalette === "shape" && (
              <Box
                sx={{ position: "absolute", top: 0, left: "64px", zIndex: 10 }}
              >
                <ShapeCreationPalette onAddShape={addShapeObject} />
              </Box>
            )}
          </Box>
          <Box
            component="main"
            sx={{
              flex: 1,
              bgcolor: "grey.50",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 3,
            }}
          >
            <PdfPreview
              invoiceData={invoiceData}
              setLayout={setLayout}
              selectedObjectId={selectedObjectId}
              onSelectObject={handleSelectObject}
              selectedCell={selectedCell}
              onSelectCell={handleSelectCell}
              variableDisplayMode={variableDisplayMode}
              companyInfo={companyInfoData?.getCompanyInfo}
            />
          </Box>
          <Box
            component="aside"
            sx={{
              width: 320,
              bgcolor: "background.paper",
              p: 2,
              borderLeft: "1px solid",
              borderColor: "divider",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {showStatePreview && <StatePreview data={layout} />}
            {(() => {
              if (activeRightPanel === "layers") {
                return (
                  <LayerPalette
                    layout={layout}
                    setLayout={setLayout}
                    selectedObjectId={selectedObjectId}
                    onSelectObject={handleSelectObject}
                    onMoveLayer={moveLayer}
                  />
                );
              }
              if (selectedCellObject) {
                return (
                  <TextObjectPalette
                    selectedObject={selectedCellObject as any} // Cast for now
                    invoiceData={invoiceData}
                    companyInfoData={companyInfoData}
                    onContentChange={(key, value) =>
                      handleCellUpdate({ [key]: value })
                    }
                    onStyleChange={(newStyle) =>
                      handleCellUpdate({
                        style: { ...selectedCellObject.style, ...newStyle },
                      })
                    }
                  />
                );
              }
              if (selectedObject) {
                return (
                  <LayoutPalette
                    invoiceData={invoiceData}
                    selectedObject={selectedObject}
                    setLayout={setLayout}
                    onMoveLayer={moveLayer}
                    onDelete={deleteSelectedObject}
                    companyInfoData={companyInfoData}
                  />
                );
              }
            })()}
          </Box>
        </Box>
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <input
          type="file"
          accept="application/pdf"
          ref={pdfInputRef}
          onChange={handlePdfUpload}
          style={{ display: "none" }}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
