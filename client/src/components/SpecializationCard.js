import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Box } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Keeping this import for the new footer style

const SpecializationCard = ({ specialization }) => {
  return (
    <Link to={`/specialization/${specialization.id}`} style={{ textDecoration: 'none', height: '100%' }}>
      <Card
        sx={{
          height: 400, // Fixed height for consistent card size
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          width: { // Responsive width from ImprovedCourseCard
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
        <Box
          sx={{
            height: 180,
            backgroundImage: `url(${specialization.image || (specialization.courses && specialization.courses.length > 0 && specialization.courses[0].bannerImage) || 'https://via.placeholder.com/400x180/2980b9/ffffff?text=Specialization'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
          }}
        />
        
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
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {specialization.name}
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
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {specialization.shortDescription}
          </Typography>

          {/* New Footer Section based on ImprovedCourseCard */}
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
                {/* Replaced AccessTimeIcon with relevant specialization info if available */}
                {/* Or you can add a label like 'Courses: X' */}
                <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                {specialization.duration || 'Self-paced'}
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
              View Courses →
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SpecializationCard;