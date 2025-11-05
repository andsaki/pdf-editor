import React from "react";
import { spacing } from "accessibility-learning/src/design-system/tokens";
import { Tooltip } from "accessibility-learning/src/components/Tooltip";
import { Container, Divider } from "../design-system/components";
import { IconButton } from "../design-system/components/IconButton";
import {
  Type,
  List as ListIcon,
  Table2,
  Square,
  Image as ImageIcon,
  FileText,
  Layers,
} from "lucide-react";

interface LeftToolbarProps {
  onAddText: () => void;
  onAddTable: () => void;
  onAddShape: () => void;
  onAddImage: () => void;
  onAddBullet: () => void;
  onAddPdf: () => void;
  onToggleLayers: () => void;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  onAddText,
  onAddTable,
  onAddShape,
  onAddImage,
  onAddBullet,
  onAddPdf,
  onToggleLayers,
}) => {
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: spacing.scale[2],
        gap: spacing.scale[1],
      }}
    >
      <Tooltip content="テキスト追加" position="right">
        <IconButton onClick={onAddText} aria-label="テキスト追加">
          <Type size={20} />
        </IconButton>
      </Tooltip>

      <Tooltip content="箇条書き追加" position="right">
        <IconButton onClick={onAddBullet} aria-label="箇条書き追加">
          <ListIcon size={20} />
        </IconButton>
      </Tooltip>

      <Tooltip content="テーブル追加" position="right">
        <IconButton onClick={onAddTable} aria-label="テーブル追加">
          <Table2 size={20} />
        </IconButton>
      </Tooltip>

      <Tooltip content="図形追加" position="right">
        <IconButton onClick={onAddShape} aria-label="図形追加">
          <Square size={20} />
        </IconButton>
      </Tooltip>

      <Tooltip content="画像追加" position="right">
        <IconButton onClick={onAddImage} aria-label="画像追加">
          <ImageIcon size={20} />
        </IconButton>
      </Tooltip>

      <Tooltip content="PDF追加" position="right">
        <IconButton onClick={onAddPdf} aria-label="PDF追加">
          <FileText size={20} />
        </IconButton>
      </Tooltip>

      <Divider sx={{ margin: `${spacing.scale[2]} 0`, width: '100%' }} />

      <Tooltip content="レイヤー表示切替" position="right">
        <IconButton onClick={onToggleLayers} aria-label="レイヤー表示切替">
          <Layers size={20} />
        </IconButton>
      </Tooltip>
    </Container>
  );
};
