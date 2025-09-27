import React from "react";
import { Box, Button, Typography, Divider } from "@mui/material";

interface ShapeCreationPaletteProps {
  onAddShape: (shapeType: 'rect' | 'h-line' | 'v-line') => void;
}

export const ShapeCreationPalette: React.FC<ShapeCreationPaletteProps> = ({
  onAddShape,
}) => {
  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1, backgroundColor: 'background.paper' }}>
      <Typography variant="subtitle2" gutterBottom>
        図形を追加
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Button variant="outlined" size="small" fullWidth onClick={() => onAddShape('rect')} sx={{ mb: 1 }}>
        四角形
      </Button>
      <Button variant="outlined" size="small" fullWidth onClick={() => onAddShape('h-line')} sx={{ mb: 1 }}>
        横線
      </Button>
      <Button variant="outlined" size="small" fullWidth onClick={() => onAddShape('v-line')}>
        縦線
      </Button>
    </Box>
  );
};
