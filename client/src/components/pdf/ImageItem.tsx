import React from "react";
import { Image } from "@react-pdf/renderer";
import type { ImageItem } from "../../../utils/types";

interface ImageItemProps {
  item: ImageItem;
}

export const PdfImageItem: React.FC<ImageItemProps> = ({ item }) => {
  return (
    <Image
      key={item.id}
      src={item.data}
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
      }}
    />
  );
};
