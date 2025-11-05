import React from "react";
import { Button } from "accessibility-learning/src/design-system/components";
import { colors, spacing, radii } from "accessibility-learning/src/design-system/tokens";
import { Container, Text, Divider } from "../design-system/components";

interface ShapeCreationPaletteProps {
  onAddShape: (shapeType: 'rect' | 'h-line' | 'v-line') => void;
}

export const ShapeCreationPalette: React.FC<ShapeCreationPaletteProps> = ({
  onAddShape,
}) => {
  return (
    <Container sx={{
      padding: spacing.scale[4],
      border: `1px solid ${colors.border.default}`,
      borderRadius: radii.borderRadius.sm,
      backgroundColor: colors.background.paper
    }}>
      <Text variant="subtitle2" gutterBottom>
        図形を追加
      </Text>
      <Divider sx={{ margin: `${spacing.scale[2]} 0` }} />
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddShape('rect')}
        style={{ width: '100%', marginBottom: spacing.scale[2] }}
      >
        四角形
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddShape('h-line')}
        style={{ width: '100%', marginBottom: spacing.scale[2] }}
      >
        横線
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddShape('v-line')}
        style={{ width: '100%' }}
      >
        縦線
      </Button>
    </Container>
  );
};
