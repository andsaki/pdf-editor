import React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
} from "@mui/material";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import TableChartIcon from "@mui/icons-material/TableChart";
import CategoryIcon from "@mui/icons-material/Category";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LayersIcon from "@mui/icons-material/Layers";

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 1,
      }}
    >
      <List>
        <ListItem sx={{ justifyContent: "center" }}>
          <Tooltip title="テキスト追加" placement="right">
            <IconButton onClick={onAddText}>
              <TextFieldsIcon />
            </IconButton>
          </Tooltip>
        </ListItem>
        <ListItem sx={{ justifyContent: "center" }}>
          <Tooltip title="箇条書き追加" placement="right">
            <IconButton onClick={onAddBullet}>
              <FormatListBulletedIcon />
            </IconButton>
          </Tooltip>
        </ListItem>
        <ListItem sx={{ justifyContent: "center" }}>
          <Tooltip title="テーブル追加" placement="right">
            <IconButton onClick={onAddTable}>
              <TableChartIcon />
            </IconButton>
          </Tooltip>
        </ListItem>
        <ListItem sx={{ justifyContent: "center" }}>
          <Tooltip title="図形追加" placement="right">
            <IconButton onClick={onAddShape}>
              <CategoryIcon />
            </IconButton>
          </Tooltip>
        </ListItem>
        <ListItem sx={{ justifyContent: "center" }}>
          <Tooltip title="画像追加" placement="right">
            <IconButton onClick={onAddImage}>
              <ImageIcon />
            </IconButton>
          </Tooltip>
        </ListItem>
        <ListItem sx={{ justifyContent: "center" }}>
          <Tooltip title="PDF追加" placement="right">
            <IconButton onClick={onAddPdf}>
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>
        </ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItem sx={{ justifyContent: "center" }}>
          <Tooltip title="レイヤー表示切替" placement="right">
            <IconButton onClick={onToggleLayers}>
              <LayersIcon />
            </IconButton>
          </Tooltip>
        </ListItem>
      </List>
    </Box>
  );
};
