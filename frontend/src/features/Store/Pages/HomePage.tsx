// import {
//   Box,
//   Button,
//   Container,
//   Grid,
//   Paper,
//   Typography,
// } from "@mui/material";
// import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import StoreNavbar from "../components/StoreNavbar";

// export default function HomePage() {
//   return (
//     <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
//       <StoreNavbar />

//       <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
//         {/* Hero section */}
//         <Paper
//           elevation={0}
//           sx={{
//             p: { xs: 3, md: 6 },
//             borderRadius: 4,
//             bgcolor: "primary.main",
//             color: "primary.contrastText",
//             overflow: "hidden",
//           }}
//         >
//           <Grid container spacing={3} sx={{ alignItems: "center" }}>
//             <Grid size={{ xs: 12, md: 8 }}>
//               <Typography
//                 variant="overline"
//                 sx={{ fontWeight: 700, letterSpacing: 2 }}
//               >
//                 WELCOME TO FLYSTORE
//               </Typography>

//               <Typography
//                 variant="h3"
//                 component="h1"
//                 sx={{
//                   fontWeight: 800,
//                   mt: 1,
//                   mb: 2,
//                   fontSize: { xs: "2rem", md: "3rem" },
//                 }}
//               >
//                 Find What You Love
//               </Typography>

//               <Typography
//                 variant="body1"
//                 sx={{ maxWidth: 520, mb: 3, opacity: 0.9 }}
//               >
//                 Explore our products, discover your favorites, and enjoy
//                 a simple shopping experience.
//               </Typography>

//               <Button
//                 variant="contained"
//                 color="inherit"
//                 endIcon={<ArrowForwardIcon />}
//                 href="#featured-products"
//                 sx={{
//                   color: "primary.main",
//                   fontWeight: 700,
//                   borderRadius: 2,
//                   px: 3,
//                   py: 1.2,
//                 }}
//               >
//                 Explore Products
//               </Button>
//             </Grid>
//           </Grid>
//         </Paper>

//         {/* Categories section */}
//         <Box sx={{ mt: 6 }}>
//           <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
//             Shop by Category
//           </Typography>

//           <Typography color="text.secondary" sx={{ mt: 1 }}>
//             Explore products by category.
//           </Typography>

//           <Paper
//             variant="outlined"
//             sx={{ mt: 2, p: 3, borderRadius: 3 }}
//           >
//             <Typography color="text.secondary">
//               Categories will be loaded from the backend.
//             </Typography>
//           </Paper>
//         </Box>

//         {/* Featured products section */}
//         <Box id="featured-products" sx={{ mt: 6 }}>
//           <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
//             Featured Products
//           </Typography>

//           <Typography color="text.secondary" sx={{ mt: 1 }}>
//             Discover products selected for you.
//           </Typography>

//           <Paper
//             variant="outlined"
//             sx={{ mt: 2, p: 3, borderRadius: 3 }}
//           >
//             <Typography color="text.secondary">
//               Featured products will be loaded from the backend.
//             </Typography>
//           </Paper>
//         </Box>

//         {/* Offers section */}
//         <Box sx={{ mt: 6, mb: 3 }}>
//           <Paper
//             variant="outlined"
//             sx={{
//               p: { xs: 3, md: 4 },
//               borderRadius: 3,
//               display: "flex",
//               alignItems: { xs: "flex-start", md: "center" },
//               flexDirection: { xs: "column", md: "row" },
//               gap: 2,
//             }}
//           >
//             <LocalOfferOutlinedIcon
//               color="primary"
//               sx={{ fontSize: 40 }}
//             />

//             <Box sx={{ flex: 1 }}>
//               <Typography variant="h5" sx={{ fontWeight: 800 }}>
//                 Special Offers
//               </Typography>

//               <Typography color="text.secondary" sx={{ mt: 1 }}>
//                 Discover available discounts and special deals.
//               </Typography>
//             </Box>

//             <Button
//               variant="outlined"
//               endIcon={<ArrowForwardIcon />}
//               href="#featured-products"
//             >
//               Browse Products
//             </Button>
//           </Paper>
//         </Box>
//       </Container>
//     </Box>
//   );
// }


import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import StoreNavbar from "../components/StoreNavbar";
import CategoryFilter, {
  type Category,
} from "../components/CategoryFilter";
import FeaturedProducts from "../components/FeaturedProducts";
import type { Product } from "../components/ProductCard";
import { mockCategories, mockProducts } from "../data/mockData";

// These arrays will be replaced with data fetched from the backend.
// const categoriesFromBackend: Category[] = [];
// const productsFromBackend: Product[] = [];

export default function HomePage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null,
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return mockProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === null ||
        product.categoryId === selectedCategory;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        (product.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [searchValue, selectedCategory]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <StoreNavbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Hero section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <Grid container spacing={3} sx={{alignItems:"center"}}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography
                variant="overline"
                sx={{ fontWeight: 700, letterSpacing: 2 }}
              >
                WELCOME TO FLYSTORE
              </Typography>

              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mt: 1,
                  mb: 2,
                  fontSize: { xs: "2rem", md: "3rem" },
                }}
              >
                Find What You Love
              </Typography>

              <Typography sx={{ maxWidth: 520, mb: 3, opacity: 0.9 }}>
                Explore our products, discover your favorites, and enjoy
                a simple shopping experience.
              </Typography>

              <Button
                variant="contained"
                color="inherit"
                endIcon={<ArrowForwardIcon />}
                href="#featured-products"
                sx={{
                  color: "primary.main",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                  py: 1.2,
                }}
              >
                Explore Products
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Categories */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" sx={{fontWeight:800}}>
            Shop by Category
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Choose a category to find the products you need.
          </Typography>

          <CategoryFilter
            categories={mockCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </Box>

        {/* Featured products */}
        <Box id="featured-products" sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" sx={{fontWeight:800}}>
            Featured Products
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            Discover products selected for you.
          </Typography>

          <FeaturedProducts products={filteredProducts} />
        </Box>

        {/* Offers */}
        <Box sx={{ mt: 6, mb: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              display: "flex",
              alignItems: { xs: "flex-start", md: "center" },
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
            }}
          >
            <LocalOfferOutlinedIcon
              color="primary"
              sx={{ fontSize: 40 }}
            />

            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Special Offers
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Discover available discounts and special deals.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              href="#featured-products"
            >
              Browse Products
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
