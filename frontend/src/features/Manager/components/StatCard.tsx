
import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  color: string;
  background: string;
}
export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  background,
}: StatCardProps) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: "1px solid #e8eaf0",
        borderRadius: 3,
        p: 2.5,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
          color,
          bgcolor: background,
          mb: 2,
        }}
      >
        {icon}
      </Box>
      <Typography color="text.secondary" variant="body2">
        {title}
      </Typography>
      <Typography variant="h4" sx={{ my: 0.5,fontWeight:700} }>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  );
}