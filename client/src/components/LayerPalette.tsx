import React from "react";
import type { InvoiceData } from "../utils/types";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Lock from "@mui/icons-material/Lock";
import LockOpen from "@mui/icons-material/LockOpen";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";

interface LayerPaletteProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onMoveLayer: (direction: "up" | "down") => void;
}

export const LayerPalette: React.FC<LayerPaletteProps> = ({
  invoiceData,
  setInvoiceData,
  selectedObjectId,
  onSelectObject,
  onMoveLayer,
}) => {
  const sortedLayout = [...invoiceData.layout].sort(
    (a, b) => b.zIndex - a.zIndex
  );

  const toggleProperty = (itemId: string, property: "locked" | "visible") => {
    const newLayout = invoiceData.layout.map((item) => {
      if (item.id === itemId) {
        return { ...item, [property]: !item[property] };
      }
      return item;
    });
    setInvoiceData((prev) => ({ ...prev, layout: newLayout }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        レイヤー
      </Typography>
      <List dense>
        {sortedLayout.map((item) => (
          <ListItem
            key={item.id}
            disablePadding
            secondaryAction={
              <>
                <Tooltip title="上に移動">
                  <IconButton
                    edge="end"
                    aria-label="move up"
                    onClick={() => onMoveLayer("up")}
                    disabled={selectedObjectId !== item.id}
                  >
                    <ArrowUpward />
                  </IconButton>
                </Tooltip>
                <Tooltip title="下に移動">
                  <IconButton
                    edge="end"
                    aria-label="move down"
                    onClick={() => onMoveLayer("down")}
                    disabled={selectedObjectId !== item.id}
                  >
                    <ArrowDownward />
                  </IconButton>
                </Tooltip>
                <Tooltip title={item.visible !== false ? "非表示" : "表示"}>
                  <IconButton
                    edge="end"
                    aria-label="toggle visibility"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProperty(item.id, "visible");
                    }}
                  >
                    {item.visible !== false ? (
                      <Visibility />
                    ) : (
                      <VisibilityOff />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title={item.locked ? "ロック解除" : "ロック"}>
                  <IconButton
                    edge="end"
                    aria-label="toggle locked"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProperty(item.id, "locked");
                    }}
                  >
                    {item.locked ? <Lock /> : <LockOpen />}
                  </IconButton>
                </Tooltip>
              </>
            }
          >
            <ListItemButton
              selected={selectedObjectId === item.id}
              onClick={() => onSelectObject(item.id)}
            >
              <ListItemText
                primary={`${item.type} - ${item.id.substring(0, 8)}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
