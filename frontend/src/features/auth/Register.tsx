
import { useState } from "react";

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

import {
    Visibility,
    VisibilityOff,

    EmailOutlined,
    LockOutlined,
    ShoppingBagOutlined,
    Person2Outlined,
} from "@mui/icons-material";

import { Link as RouterLink, useNavigate } from "react-router-dom";

import { Controller, useForm } from "react-hook-form";


import {
    registerSchema,
    type RegisterFormValues,
} from "../auth/Schema/RegisterSchema";

import { registerUser } from "../../Hooks/UseRegister";
import { zodResolver } from "@hookform/resolvers/zod";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            full_name: "",
            email: "",
            password: "",
            password_confirmation: "",
        },
        mode: "onBlur",
    });

    const onSubmit = async (values: RegisterFormValues) => {
        setServerError("");
        setSuccessMessage("");

        try {
            const response = await registerUser(values);

            setSuccessMessage(
                response.message || "created ac"
            );

            
            navigate("/login", {
                state: {
                    registered: true,
                    email: values.email,
                },
            });
        } catch {
            setServerError(
                "some thing wrong please chick your credentials"
            );
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    md: "0.9fr 1.1fr",
                },
                bgcolor: "#F5F7FC",
            }}
        >
            {/* الجانب التعريفي */}
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
                    <ShoppingBagOutlined
                        sx={{ fontSize: 38, color: "#2459C4" }}
                    />

                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        ShopEase
                    </Typography>
                </Stack>

                <Box>
                    <Typography
                        variant="h3"
                        sx={{
                            lineHeight: 1.3, mb: 2,
                            fontWeight: 800

                        }}
                    >
                        start your shopping journey
                        <br />
                        with ShopEase.
                    </Typography>

                    <Typography
                        sx={{
                            maxWidth: 420,
                            color: "#5B6B85",
                            lineHeight: 1.9,
                        }}
                    >
                        create your account to track your orders and enjoy a smoother shopping experience.
                    
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                    
          easy shopping , great experience
                </Typography>
            </Box>

            <Container
                maxWidth="sm"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 4,
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
                    }}
                >
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                                create your account
                            </Typography>

                            <Typography color="text.secondary">
                              enter your data to start shopping.
                            </Typography>
                        </Box>

                        {serverError && (
                            <Alert severity="error">
                                {serverError}
                            </Alert>
                        )}

                        {successMessage && (
                            <Alert severity="success">
                                {successMessage}
                            </Alert>
                        )}

                        <Box
                            component="form"
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                        >
                            <Stack spacing={2.5}>
                                <Controller
                                    name="full_name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="full name"
                                            autoComplete="name"
                                            error={Boolean(errors.full_name)}
                                            helperText={errors.full_name?.message}
                                            disabled={isSubmitting}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Person2Outlined />
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="email"
                                            type="email"
                                            autoComplete="email"
                                            error={Boolean(errors.email)}
                                            helperText={errors.email?.message}
                                            disabled={isSubmitting}
                                            slotProps={{
                                                htmlInput: { dir: "ltr" },
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
                                            autoComplete="new-password"
                                            error={Boolean(errors.password)}
                                            helperText={errors.password?.message}
                                            disabled={isSubmitting}
                                            slotProps={{
                                                htmlInput: { dir: "ltr" },
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
                                                                aria-label="hide or show the password"
                                                                onClick={() =>
                                                                    setShowPassword((value) => !value)
                                                                }
                                                                edge="end"
                                                            >
                                                                {showPassword
                                                                    ? <VisibilityOff />
                                                                    : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="password_confirmation"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="password confirmation"
                                            type={
                                                showConfirmation ? "text" : "password"
                                            }
                                            autoComplete="new-password"
                                            error={Boolean(errors.password_confirmation)}
                                            helperText={
                                                errors.password_confirmation?.message
                                            }
                                            disabled={isSubmitting}
                                            slotProps={{
                                                htmlInput: { dir: "ltr" },
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                type="button"
                                                                aria-label='hide or show the password'
                                                                onClick={() =>
                                                                    setShowConfirmation((value) => !value)
                                                                }
                                                                edge="end"
                                                            >
                                                                {showConfirmation
                                                                    ? <VisibilityOff />
                                                                    : <Visibility />}
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
                                    disabled={isSubmitting}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: 700,
                                        textTransform: "none",
                                        bgcolor: "#2459C4",
                                        "&:hover": {
                                            bgcolor: "#19449B",
                                        },
                                    }}
                                >
                                    {isSubmitting ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                            "create account"
                                    )}
                                </Button>
                            </Stack>
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary", textAlign: "center"
                            }}
                        >
                already have an accountb?{" "}
                            <Link
                                component={RouterLink}
                                to="/login"
                                underline="hover"
                            >
                                login
                            </Link>
                        </Typography>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
