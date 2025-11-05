import { useState, useRef, useMemo, useCallback } from "react";
import { colors } from "accessibility-learning/src/design-system/tokens";
import { Container } from "./design-system/components";
import { PdfPreview } from "./components/PdfPreview";
import { EditorAppBar } from "./components/EditorAppBar";
import { EditorLeftSidebar } from "./components/EditorLeftSidebar";
import { EditorRightSidebar } from "./components/EditorRightSidebar";
import type {
  InvoiceData,
  LayoutItem,
  TableCell,
  TableItem,
} from "./utils/types";
import { useHistoryState } from "./hooks/useHistoryState";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useLayoutOperations } from "./hooks/useLayoutOperations";
import { useFileUpload } from "./hooks/useFileUpload";
import { usePdfGeneration } from "./hooks/usePdfGeneration";
import { useQuery, useMutation } from "@apollo/client";
import {
  UPDATE_INVOICE_MUTATION,
  GET_COMPANY_INFO,
  GET_INVOICE,
} from "./graphql/invoiceQueries";

/**
 * 請求書エディターのメインコンポーネント
 *
 * 以下の機能を提供します：
 * - レイアウトアイテムの管理（テキスト、テーブル、画像、図形）
 * - レイヤー管理とz-index制御
 * - クリップボード操作（コピー/カット/ペースト）
 * - 元に戻す/やり直し機能
 * - PDFプレビューと生成（React-PDFとPlaywright）
 * - GraphQLによるデータ永続化
 */
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
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
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

  const [updateInvoiceMutation] = useMutation(UPDATE_INVOICE_MUTATION);
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

  const toggleLayersPanel = () => {
    setActiveRightPanel((prev) =>
      prev === "layers" ? "properties" : "layers"
    );
  };

  const handleSelectObject = (objectId: string | null, multiSelect?: boolean) => {
    if (multiSelect && objectId) {
      // 複数選択モード
      setSelectedObjectIds((prev) => {
        if (prev.includes(objectId)) {
          // 既に選択されている場合は解除
          return prev.filter((id) => id !== objectId);
        } else {
          // 選択に追加
          return [...prev, objectId];
        }
      });
      setSelectedObjectId(objectId); // 最後に選択したものをprimaryに
    } else {
      // 単一選択モード
      setSelectedObjectId(objectId);
      setSelectedObjectIds(objectId ? [objectId] : []);
    }
    if (objectId) {
      setActiveRightPanel("properties");
      setSelectedCell(null); // オブジェクトが選択されたらセルの選択を解除
    }
  };

  // カスタムフックを使用してロジックを分離
  const layoutOperations = useLayoutOperations(
    layout,
    setLayout,
    selectedObjectId,
    handleSelectObject
  );

  const fileUpload = useFileUpload(layout, setLayout);

  const pdfGeneration = usePdfGeneration(
    invoiceData,
    companyInfoData?.getCompanyInfo
  );

  const handleSelectCell = (
    selection: { tableId: string; rowIndex: number; cellIndex: number } | null
  ) => {
    setSelectedCell(selection);
    if (selection) {
      setSelectedObjectId(null); // セルが選択されたらオブジェクトの選択を解除
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

  // クリップボード操作用のラッパー関数
  const copy = useCallback(() => {
    const copiedItem = layoutOperations.copy();
    if (copiedItem) {
      setClipboard(copiedItem);
    }
  }, [layoutOperations]);

  const cut = useCallback(() => {
    const cutItem = layoutOperations.cut();
    if (cutItem) {
      setClipboard(cutItem);
    }
  }, [layoutOperations]);

  const paste = useCallback(() => {
    layoutOperations.paste(clipboard);
  }, [layoutOperations, clipboard]);

  const saveInvoice = async () => {
    try {
      // Apollo Clientが追加する__typename フィールドを削除
      const cleanData = JSON.parse(
        JSON.stringify(invoiceData, (key, value) =>
          key === "__typename" ? undefined : value
        )
      );
      console.log("Attempting to update invoice data:", cleanData);
      const result = await updateInvoiceMutation({
        variables: {
          id: "1", // TODO: 実際の請求書IDを取得
          input: {
            name: "請求書",
            layout: cleanData.layout,
            form: cleanData.form,
          },
        },
      });
      console.log("Update result:", result);
      alert("請求書を保存しました！");
    } catch (e: any) {
      console.error("Error updating invoice:", e);
      console.error("GraphQL errors:", e.graphQLErrors);
      console.error("Network error:", e.networkError);
      const errorMessage = e.graphQLErrors?.[0]?.message || e.networkError?.message || e.message || "Unknown error";
      alert(`請求書の保存中にエラーが発生しました: ${errorMessage}`);
    }
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

  // キーボードショートカット
  useKeyboardShortcuts({
    onCopy: copy,
    onCut: cut,
    onPaste: paste,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <EditorAppBar
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onCopy={copy}
          onCut={cut}
          onPaste={paste}
          onDelete={layoutOperations.deleteSelectedObject}
          hasSelectedObject={!!selectedObjectId}
          hasClipboard={!!clipboard}
          variableDisplayMode={variableDisplayMode}
          onToggleVariableDisplay={() =>
            setVariableDisplayMode((prev) =>
              prev === "name" ? "example" : "name"
            )
          }
          onPreviewPlaywright={pdfGeneration.openPdfWithPlaywright}
          onShowStatePreview={() => setShowStatePreview((prev) => !prev)}
          onSave={saveInvoice}
        />
        <Container sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <EditorLeftSidebar
            onAddText={layoutOperations.addTextObject}
            onAddBullet={layoutOperations.addBulletObject}
            onAddTable={layoutOperations.addTableObject}
            onAddShape={() =>
              setActiveCreationPalette((prev) =>
                prev === "shape" ? null : "shape"
              )
            }
            onAddImage={() => imageInputRef.current?.click()}
            onAddPdf={() => pdfInputRef.current?.click()}
            onToggleLayers={toggleLayersPanel}
            onAddShapeObject={layoutOperations.addShapeObject}
            activeCreationPalette={activeCreationPalette}
            onCloseCreationPalette={() => setActiveCreationPalette(null)}
          />
          <Container
            sx={{
              flex: 1,
              backgroundColor: colors.background.default,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "24px",
              position: "relative",
            }}
          >
            <PdfPreview
              invoiceData={invoiceData}
              setLayout={setLayout}
              selectedObjectId={selectedObjectId}
              selectedObjectIds={selectedObjectIds}
              onSelectObject={handleSelectObject}
              selectedCell={selectedCell}
              onSelectCell={handleSelectCell}
              variableDisplayMode={variableDisplayMode}
              companyInfo={companyInfoData?.getCompanyInfo}
            />
            {pdfGeneration.isGenerating && (
              <Container
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  zIndex: 9999,
                }}
              >
                <Container
                  sx={{
                    backgroundColor: colors.background.paper,
                    padding: "32px",
                    borderRadius: "8px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    textAlign: "center",
                  }}
                >
                  <Container sx={{ marginBottom: "16px", fontSize: "1.2rem", fontWeight: "bold" }}>
                    生成中...
                  </Container>
                  <Container sx={{ fontSize: "0.9rem", color: colors.text.secondary }}>
                    PDFを生成しています
                  </Container>
                </Container>
              </Container>
            )}
          </Container>
          <EditorRightSidebar
            activeRightPanel={activeRightPanel}
            showStatePreview={showStatePreview}
            layout={layout}
            setLayout={setLayout}
            selectedObjectId={selectedObjectId}
            onSelectObject={handleSelectObject}
            onMoveLayer={layoutOperations.moveLayer}
            selectedCellObject={selectedCellObject}
            invoiceData={invoiceData}
            companyInfoData={companyInfoData}
            onCellContentChange={(key, value) =>
              handleCellUpdate({ [key]: value })
            }
            onCellStyleChange={(newStyle) =>
              handleCellUpdate({
                style: { ...selectedCellObject!.style, ...newStyle },
              })
            }
            selectedObject={selectedObject}
            onDelete={layoutOperations.deleteSelectedObject}
          />
        </Container>
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={fileUpload.handleImageUpload}
          style={{ display: "none" }}
        />
        <input
          type="file"
          accept="application/pdf"
          ref={pdfInputRef}
          onChange={fileUpload.handlePdfUpload}
          style={{ display: "none" }}
        />
    </div>
  );
}

export default App;
