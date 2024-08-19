'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState, MouseEvent } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Container, Grid, Box, Typography, Card, CardActionArea, CardContent, AppBar, Toolbar, Button, TextField, IconButton, Menu, MenuItem } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import { CirclePicker } from 'react-color';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [collections, setCollections] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('name');
  const [frontColor, setFrontColor] = useState('#0F9ED5'); 
  const [backColor, setBackColor] = useState('#E54792'); 
  const [anchorElSort, setAnchorElSort] = useState(null);
  const [anchorElColor, setAnchorElColor] = useState(null);
  const searchParams = useSearchParams();
  const search = searchParams.get('id');
  const router = useRouter();

  useEffect(() => {
    async function getCollections() {
      if (!user) {
        return;
      }
      const userDocRef = doc(collection(db, 'users'), user.id);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setCollections(data.flashcards || []);
      }
    }
    getCollections();
  }, [user]);

  useEffect(() => {
    async function getFlashcards() {
      if (!search || !user) {
        return;
      }
      const colRef = collection(doc(collection(db, 'users'), user.id), search);
      const docs = await getDocs(colRef);
      const flashcards = [];

      docs.forEach((doc) => {
        flashcards.push({ id: doc.id, ...doc.data() });
      });

      const filteredFlashcards = flashcards.filter(flashcard =>
        flashcard.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flashcard.back.toLowerCase().includes(searchQuery.toLowerCase())
      );

      filteredFlashcards.sort((a, b) => {
        if (sortOrder === 'date') {
          return a.date - b.date; 
        } else if (sortOrder === 'thematic') {
          const thematicA = a.thematic || '';
          const thematicB = b.thematic || '';
          return thematicA.localeCompare(thematicB);
        } else {
          return a.front.localeCompare(b.front);
        }
      });

      setFlashcards(filteredFlashcards);
    }
    getFlashcards();
  }, [user, search, searchQuery, sortOrder]);

  const handleCollectionClick = (name) => {
    router.push(`/flashcards?id=${name}`);
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleFrontColorChange = (color) => {
    setFrontColor(color.hex);
  };

  const handleBackColorChange = (color) => {
    setBackColor(color.hex);
  };

  const handleSortClick = (event) => {
    setAnchorElSort(event.currentTarget);
  };

  const handleCloseSort = () => {
    setAnchorElSort(null);
  };

  const handleColorClick = (event) => {
    setAnchorElColor(event.currentTarget);
  };

  const handleCloseColor = () => {
    setAnchorElColor(null);
  };

  const handleSortOptionClick = (option) => {
    setSortOrder(option);
    handleCloseSort();
  };

  if (!isLoaded) {
    return <></>;
  }

  return (
    <Container maxWidth="100vw" sx={{ backgroundColor: '#E5F4FB', minHeight: '100vh' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Button
            onClick={() => router.push('/')}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              mt: 2,
              ml: 2,
              padding: 0,
              minWidth: 'auto',
              height: 'auto',
              fontFamily: "Porkys, sans-serif",
              fontSize: '2.5rem',
              textTransform: 'none',
              color: '#0F9ED5',
              ':after': {
                content: '"M"',
                display: 'inline-block',
                fontFamily: 'Porkys, sans-serif',
                fontSize: '2.5rem',
                color: '#0F9ED5',
                marginRight: '-0.5rem',
              },
              ':before': {
                content: '"M"',
                display: 'inline-block',
                fontFamily: 'Porkys, sans-serif',
                fontSize: '2.5rem',
                color: '#E54792',
              }
            }}
          />
          <Box sx={{ flexGrow: 1 }} />
          {!isSignedIn && (
            <>
              <Button onClick={() => router.push('/sign-in')} color="primary" variant="contained" sx={{ color: 'white', fontWeight: 'bold', borderRadius: 5 }}>
                Log In
              </Button>
              <Button onClick={() => router.push('/sign-up')} color="primary" variant="contained" sx={{ color: 'white', fontWeight: 'bold', borderRadius: 5, ml: 2 }}>
                Sign Up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!search ? (
          <>
            <Typography variant="h4" sx={{ color: '#E54792', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', mb: 4 }}>
              Your Flashcard Collections
            </Typography>
            {collections.length === 0 ? (
              <Typography variant="h6" sx={{ color: '#E54792', textAlign: 'center', mt: 4, fontWeight: 'bold' }}>
                No flashcards available, please create some.
              </Typography>
            ) : (
              <Grid container spacing={3} sx={{ mt: 4 }}>
                {collections.map((collection, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ boxShadow: 3 }}>
                      <CardActionArea onClick={() => handleCollectionClick(collection.name)}>
                        <CardContent>
                          <Typography variant="h5" component="div">
                            {collection.name}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        ) : (
          <Box sx={{ width: '100%', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <TextField
                variant="outlined"
                placeholder="Search flashcards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    border: 'none',
                    backgroundColor: '#E5F4FB',
                  },
                  '& .MuiInputBase-input': {
                    padding: '10px',
                  },
                  flexGrow: 1,
                }}
                InputProps={{
                  endAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton onClick={handleSortClick}>
                        <ArrowDropDownIcon sx={{ color: '#0F9ED5' }} />
                      </IconButton>
                      <IconButton onClick={handleColorClick}>
                        <MoreVertIcon sx={{ color: '#0F9ED5' }} />
                      </IconButton>
                    </Box>
                  ),
                }}
              />
            </Box>
            <Menu
              anchorEl={anchorElSort}
              open={Boolean(anchorElSort)}
              onClose={handleCloseSort}
              PaperProps={{ sx: { width: 200 } }}
            >
              <MenuItem onClick={() => handleSortOptionClick('name')}>Sort by Name</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick('date')}>Sort by Date</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick('thematic')}>Sort by Thematic</MenuItem>
            </Menu>
            <Menu
              anchorEl={anchorElColor}
              open={Boolean(anchorElColor)}
              onClose={handleCloseColor}
              PaperProps={{ sx: { width: 300, padding: 2 } }}
            >
              <Typography variant="h6" sx={{ color: '#0F9ED5', mb: 2 }}>Question Card Color</Typography>
              <CirclePicker color={frontColor} onChangeComplete={handleFrontColorChange} />
              <Typography variant="h6" sx={{ color: '#E54792', mt: 2, mb: 2 }}>Answer Card Color</Typography>
              <CirclePicker color={backColor} onChangeComplete={handleBackColorChange} />
            </Menu>
            <Grid container spacing={3} sx={{ mt: 4 }}>
              {flashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ boxShadow: 3 }}>
                    <CardActionArea onClick={() => handleCardClick(index)}>
                      <CardContent>
                        <Box
                          sx={{
                            perspective: '1000px',
                            '& > div': {
                              transition: 'transform 0.6s',
                              transformStyle: 'preserve-3d',
                              position: 'relative',
                              width: '100%',
                              height: '200px',
                              boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                              transform: flipped[index]
                                ? 'rotateY(180deg)'
                                : 'rotateY(0deg)',
                            },
                            '& > div > div': {
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              backfaceVisibility: 'hidden',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: 2,
                              boxSizing: 'border-box',
                            },
                            '& > div > div:nth-of-type(1)': {
                              backgroundColor: frontColor,
                              color: 'white',
                            },
                            '& > div > div:nth-of-type(2)': {
                              backgroundColor: backColor,
                              color: 'white',
                              transform: 'rotateY(180deg)',
                            },
                          }}
                        >
                          <div>
                            <div>
                              <Typography variant="h5" component="div">
                                {flashcard.front}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="h5" component="div">
                                {flashcard.back}
                              </Typography>
                            </div>
                          </div>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
}