import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { Link as RouterLink } from "react-router-dom";

import {
  EmailOutlined,
  LockOutlined,
  ShoppingBagOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "../../Hooks/UseAuth";
import { loginSchema, type LoginFormValues } from "../auth/Schema/LoginSchema";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "minmax(0, 0.9fr) minmax(420px, 1.1fr)",
        },
        bgcolor: "#F5F7FC",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: { md: 6, lg: 9 },
          color: "#172B4D",
          background:
            "linear-gradient(145deg, #E8F0FF 0%, #F7F9FF 70%, #DCE8FF 100%)",
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <ShoppingBagOutlined sx={{ fontSize: 38, color: "#2459C4" }} />

          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            ShopEase
          </Typography>
        </Stack>

        <Box>
          <Typography
            variant="h3"
            sx={{
              lineHeight: 1.25,
              mb: 2,
              fontWeight: 800,
            }}
          >
            Every things you need
            <br />
            in one place
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#5B6B85",
              maxWidth: 420,
              lineHeight: 1.9,
            }}
          >
            Discover your favorite products and enjoy an easy and secure
            shopping experience.
          </Typography>

          <Stack spacing={2.5} sx={{ mt: 5 }}>
            {[
              "Brwose product esaily",
              "track your orders all in one place",
              "simple an injoyable experience ",
            ].map((item) => (
              <Stack
                key={item}
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <ShoppingBagOutlined color="primary" />
                <Typography>{item}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary">
          easy shopping , great experience
        </Typography>
      </Box>

      {/* جانب نموذج تسجيل الدخول */}
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 5,
          px: { xs: 2, sm: 4 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  mb: 1,
                  fontWeight: 800,
                }}
              >
                welcome back!
              </Typography>

              <Typography color="text.secondary">
                Login to your account.
              </Typography>
            </Box>

            {loginMutation.isError && (
              <Alert severity="error">
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : "Something went wrong. Please try again."}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={2.5}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="email"
                      placeholder="you@example.com"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      error={Boolean(errors.email)}
                      helperText={errors.email?.message}
                      disabled={loginMutation.isPending}
                      slotProps={{
                        htmlInput: {
                          dir: "ltr",
                        },
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailOutlined />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      error={Boolean(errors.password)}
                      helperText={errors.password?.message}
                      disabled={loginMutation.isPending}
                      slotProps={{
                        htmlInput: {
                          dir: "ltr",
                        },
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlined />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                type="button"
                                edge="end"
                                aria-label={
                                  showPassword
                                    ? "hide password"
                                    : "show password"
                                }
                                onClick={() =>
                                  setShowPassword((value) => !value)
                                }
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={loginMutation.isPending}
                  sx={{
                    py: 1.5,
                    mt: 1,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                    bgcolor: "#2459C4",
                    "&:hover": {
                      bgcolor: "#19449B",
                    },
                  }}
                >
                  {loginMutation.isPending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "login"
                  )}
                </Button>
              </Stack>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: "center",
              }}
            >
              Don't Have An Account ?{" "}
              <Link component={RouterLink} to="/register" underline="hover">
                Create Account
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
