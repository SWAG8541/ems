import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Toolbar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Article as ArticleIcon,
  FilterAlt as FilterAltIcon
} from '@mui/icons-material';

// Mock data for content items
const mockContentItems = [
  {
    id: '1',
    title: 'Homepage',
    slug: 'homepage',
    status: 'published',
    contentType: 'page',
    author: { name: 'Admin User' },
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-20T14:45:00Z'
  },
  {
    id: '2',
    title: 'About Us',
    slug: 'about-us',
    status: 'published',
    contentType: 'page',
    author: { name: 'Admin User' },
    createdAt: '2023-06-16T09:20:00Z',
    updatedAt: '2023-06-16T09:20:00Z'
  },
  {
    id: '3',
    title: 'Contact Us',
    slug: 'contact-us',
    status: 'published',
    contentType: 'page',
    author: { name: 'Admin User' },
    createdAt: '2023-06-17T11:15:00Z',
    updatedAt: '2023-06-19T16:30:00Z'
  },
  {
    id: '4',
    title: 'Latest News',
    slug: 'latest-news',
    status: 'draft',
    contentType: 'post',
    author: { name: 'John Doe' },
    createdAt: '2023-06-18T08:45:00Z',
    updatedAt: '2023-06-18T08:45:00Z'
  },
  {
    id: '5',
    title: 'Product Announcement',
    slug: 'product-announcement',
    status: 'draft',
    contentType: 'post',
    author: { name: 'John Doe' },
    createdAt: '2023-06-19T13:10:00Z',
    updatedAt: '2023-06-19T13:10:00Z'
  },
  {
    id: '6',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    status: 'published',
    contentType: 'page',
    author: { name: 'Admin User' },
    createdAt: '2023-06-20T15:30:00Z',
    updatedAt: '2023-06-20T15:30:00Z'
  },
  {
    id: '7',
    title: 'Terms of Service',
    slug: 'terms-of-service',
    status: 'published',
    contentType: 'page',
    author: { name: 'Admin User' },
    createdAt: '2023-06-21T10:00:00Z',
    updatedAt: '2023-06-21T10:00:00Z'
  },
  {
    id: '8',
    title: 'Company Update',
    slug: 'company-update',
    status: 'archived',
    contentType: 'post',
    author: { name: 'Jane Smith' },
    createdAt: '2023-06-22T09:15:00Z',
    updatedAt: '2023-06-23T11:20:00Z'
  }
];

const ContentListPage = () => {
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Fetch content items
  useEffect(() => {
    const fetchContentItems = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setContentItems(mockContentItems);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch content items');
        setLoading(false);
      }
    };

    fetchContentItems();
  }, []);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle filter menu
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    handleFilterClose();
    setPage(0);
  };

  // Handle type filter
  const handleTypeFilter = (type) => {
    setTypeFilter(type);
    handleFilterClose();
    setPage(0);
  };

  // Handle action menu
  const handleActionClick = (event, id) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedItemId(id);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedItemId(null);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Filter and search content items
  const filteredItems = contentItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.contentType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Content
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/content/new"
        >
          Create Content
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2}>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
          <TextField
            variant="outlined"
            placeholder="Search content..."
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ mr: 2, flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Filter list">
            <IconButton onClick={handleFilterClick}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
            PaperProps={{
              elevation: 3,
              sx: { minWidth: 200 }
            }}
          >
            <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
              Status
            </Typography>
            <MenuItem 
              onClick={() => handleStatusFilter('all')}
              selected={statusFilter === 'all'}
            >
              <ListItemText primary="All" />
            </MenuItem>
            <MenuItem 
              onClick={() => handleStatusFilter('published')}
              selected={statusFilter === 'published'}
            >
              <ListItemIcon>
                <Chip 
                  label="Published" 
                  size="small" 
                  color="success" 
                  sx={{ height: 20, fontSize: '0.75rem' }} 
                />
              </ListItemIcon>
              <ListItemText primary="Published" />
            </MenuItem>
            <MenuItem 
              onClick={() => handleStatusFilter('draft')}
              selected={statusFilter === 'draft'}
            >
              <ListItemIcon>
                <Chip 
                  label="Draft" 
                  size="small" 
                  color="warning" 
                  sx={{ height: 20, fontSize: '0.75rem' }} 
                />
              </ListItemIcon>
              <ListItemText primary="Draft" />
            </MenuItem>
            <MenuItem 
              onClick={() => handleStatusFilter('archived')}
              selected={statusFilter === 'archived'}
            >
              <ListItemIcon>
                <Chip 
                  label="Archived" 
                  size="small" 
                  color="error" 
                  sx={{ height: 20, fontSize: '0.75rem' }} 
                />
              </ListItemIcon>
              <ListItemText primary="Archived" />
            </MenuItem>
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
              Content Type
            </Typography>
            <MenuItem 
              onClick={() => handleTypeFilter('all')}
              selected={typeFilter === 'all'}
            >
              <ListItemText primary="All" />
            </MenuItem>
            <MenuItem 
              onClick={() => handleTypeFilter('page')}
              selected={typeFilter === 'page'}
            >
              <ListItemText primary="Page" />
            </MenuItem>
            <MenuItem 
              onClick={() => handleTypeFilter('post')}
              selected={typeFilter === 'post'}
            >
              <ListItemText primary="Post" />
            </MenuItem>
          </Menu>
        </Toolbar>

        {/* Active filters display */}
        {(statusFilter !== 'all' || typeFilter !== 'all') && (
          <Box sx={{ px: 2, pb: 1, display: 'flex', alignItems: 'center' }}>
            <FilterAltIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Filters:
            </Typography>
            {statusFilter !== 'all' && (
              <Chip
                label={`Status: ${statusFilter}`}
                size="small"
                onDelete={() => handleStatusFilter('all')}
                sx={{ mr: 1 }}
              />
            )}
            {typeFilter !== 'all' && (
              <Chip
                label={`Type: ${typeFilter}`}
                size="small"
                onDelete={() => handleTypeFilter('all')}
              />
            )}
          </Box>
        )}

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                    <TableCell><Skeleton variant="text" width={120} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={100} /></TableCell>
                  </TableRow>
                ))
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">No content items found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Try adjusting your search or filter criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                // Content items
                filteredItems
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ArticleIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              /{item.slug}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          size="small"
                          color={getStatusChipColor(item.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.author.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(item.updatedAt)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            component={Link}
                            to={`/content/${item.id}`}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            component={Link}
                            to={`/content/${item.id}/edit`}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More actions">
                          <IconButton
                            size="small"
                            onClick={(e) => handleActionClick(e, item.id)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Action menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 180 }
        }}
      >
        <MenuItem 
          component={Link} 
          to={`/content/${selectedItemId}`}
          onClick={handleActionClose}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View" />
        </MenuItem>
        <MenuItem 
          component={Link} 
          to={`/content/${selectedItemId}/edit`}
          onClick={handleActionClose}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleActionClose} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ContentListPage;
