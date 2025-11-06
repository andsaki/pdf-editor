import React from "react";
import type { LayoutItem } from "../utils/types";
import { Container, Text, Button } from "../design-system/components";
import { spacing } from "../design-system/tokens";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Lock from "@mui/icons-material/Lock";
import LockOpen from "@mui/icons-material/LockOpen";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";

interface LayerPaletteProps {
  layout: LayoutItem[];
  setLayout: React.Dispatch<React.SetStateAction<LayoutItem[]>>;
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onMoveLayer: (direction: "up" | "down") => void;
}

export const LayerPalette: React.FC<LayerPaletteProps> = ({
  layout,
  setLayout,
  selectedObjectId,
  onSelectObject,
  onMoveLayer,
}) => {
  const sortedLayout = [...layout].sort(
    (a, b) => b.zIndex - a.zIndex
  );

  const toggleProperty = (itemId: string, property: "locked" | "visible") => {
    setLayout((prevLayout) =>
      prevLayout.map((item) => {
        if (item.id === itemId) {
          return { ...item, [property]: !item[property] };
        }
        return item;
      })
    );
  };

  return (
    <Container style={{ padding: spacing.scale[4] }}>
      <Text variant="h6" style={{ marginBottom: spacing.scale[2] }}>
        レイヤー
      </Text>
      <Container as="ul" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {sortedLayout.map((item) => (
          <Container
            key={item.id}
            as="li"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.scale[1],
              padding: spacing.scale[2],
              marginBottom: spacing.scale[1],
              border: '1px solid',
              borderColor: selectedObjectId === item.id ? 'primary.main' : 'divider',
              borderRadius: '4px',
              backgroundColor: selectedObjectId === item.id ? 'action.selected' : 'transparent',
              cursor: 'pointer',
            }}
            onClick={() => onSelectObject(item.id)}
          >
            <Container style={{ flex: 1 }}>
              <Text variant="body">
                {`${item.type} - ${item.id.substring(0, 8)}`}
              </Text>
            </Container>
            <Container style={{ display: 'flex', gap: spacing.scale[1] }}>
              <Button
                variant="outline"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onMoveLayer("up");
                }}
                disabled={selectedObjectId !== item.id}
                aria-label="上に移動"
                title="上に移動"
                style={{ minWidth: 'auto', padding: spacing.scale[1] }}
              >
                <ArrowUpward fontSize="small" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onMoveLayer("down");
                }}
                disabled={selectedObjectId !== item.id}
                aria-label="下に移動"
                title="下に移動"
                style={{ minWidth: 'auto', padding: spacing.scale[1] }}
              >
                <ArrowDownward fontSize="small" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  toggleProperty(item.id, "visible");
                }}
                aria-label={item.visible !== false ? "非表示" : "表示"}
                title={item.visible !== false ? "非表示" : "表示"}
                style={{ minWidth: 'auto', padding: spacing.scale[1] }}
              >
                {item.visible !== false ? (
                  <Visibility fontSize="small" />
                ) : (
                  <VisibilityOff fontSize="small" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  toggleProperty(item.id, "locked");
                }}
                aria-label={item.locked ? "ロック解除" : "ロック"}
                title={item.locked ? "ロック解除" : "ロック"}
                style={{ minWidth: 'auto', padding: spacing.scale[1] }}
              >
                {item.locked ? <Lock fontSize="small" /> : <LockOpen fontSize="small" />}
              </Button>
            </Container>
          </Container>
        ))}
      </Container>
    </Container>
  );
};
