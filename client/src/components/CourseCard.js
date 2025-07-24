import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const ImprovedCourseCard = ({ course }) => {
  return (
    <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none', height: '100%' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          width: {
            xs: '100%',
            sm: '100%',
            md: 320,
            lg: 350,
          },
          mx: 'auto',
          background: 'linear-gradient(to bottom right, #f0f4ff, #e8f0fe)',
          transition: 'all 0.4s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            background: 'linear-gradient(to bottom right, #e0ecff, #d2e3fc)',
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              height: {
                xs: 140,
                sm: 160,
                md: 180,
              },
              backgroundImage: `url(${course.bannerImage || 'https://placehold.co/400x180/e2e8f0/475569?text=Course+Image'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <Chip
            label={course.type === 'Paid' ? `₹${course.price}` : 'Free'}
            color={course.type === 'Paid' ? 'secondary' : 'success'}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontWeight: 'bold',
              color: 'white',
              fontSize: {
                xs: '0.7rem',
                sm: '0.75rem',
              },
            }}
          />
        </Box>

        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            p: {
              xs: 1.5,
              sm: 2,
            },
          }}
        >
          <Typography
            gutterBottom
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 'bold',
              fontSize: {
                xs: '1rem',
                sm: '1.1rem',
              },
              mb: 1,
              color: '#1a237e', // deep blue
            }}
          >
            {course.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              flexGrow: 1,
              fontSize: {
                xs: '0.8rem',
                sm: '0.9rem',
              },
            }}
          >
            {course.shortDescription}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 'auto',
              pt: 2,
              borderTop: '1px solid #ccc',
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: {
                  xs: '0.75rem',
                  sm: '0.85rem',
                },
              }}
            >
              <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
              {course.duration || 'Self-paced'}
            </Typography>

            <Typography
              variant="body2"
              color="primary"
              sx={{
                fontWeight: 'bold',
                fontSize: {
                  xs: '0.75rem',
                  sm: '0.85rem',
                },
              }}
            >
              View Details →
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ImprovedCourseCard;
