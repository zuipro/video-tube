import React, { useState, useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, Stack, TextField,Button as MuiButton, Dialog, DialogTitle, DialogActions } from '@mui/material'
import { Link } from 'react-router-dom'
import ReactPlayer from 'react-player'
import Button from './button'
import { getAvideo, toggleSubscription, getVideoComments,addComment, deleteVideo } from '../api/videos'
import { useSelector } from 'react-redux'

function Video() {
  const [error, setError] = useState()
  const [video, setVideo] = useState()
  const [comments, setComments] = useState([])
  const [subscribed, setSubscribed] = useState(false)
  const [newComment, setNewComment] = useState('')
  const userData = useSelector((state) => state.auth.userData)
  const username=userData.username
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { videoId } = useParams();
  const navigate=useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAvideo({ videoId })
        setVideo(res[0])
        console.log(video.owner._id===userData._id);
        
        const res1 = await getVideoComments(videoId)
        setComments(res1)
      } catch (err) {
        setError(err.message)
      }
    }

    fetchData()
  }, [videoId])

  const handleClick = async () => {
    try {
      const res = await toggleSubscription(userData?._id, video.owner._id)
      if (res) setSubscribed(prev => !prev)
    } catch (error) {
      console.log(error.message)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const res = await addComment(videoId,newComment)
      if (res) {
        // console.log(username)

        setComments(prev => [...prev, {...res,username}])
        setNewComment('')
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const handleDeleteVideo=()=>{
    console.log(1234);
    if(deleteVideo(video._id)) navigate('/')
    setConfirmDelete(false);
    
  }

  const openDeleteDialog = () => setConfirmDelete(true);
  const closeDeleteDialog = () => setConfirmDelete(false);
  const handleConfirmDelete = () => {
    console.log('Video deleted');
    setConfirmDelete(false);
  };

  return (
    <Box minHeight="95vh" p={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        <Box flex={1}>
          <Box sx={{ width: "100%", position: "sticky", top: "86px" }}>
            <ReactPlayer url={`${video?.videoFile}`} className="react-player" controls width="100%" height="auto" />
            <Typography color="#fff" variant="h5" fontWeight="bold" p={2}>
              {video?.title}
            </Typography>
            <Stack direction="row" justifyContent="space-between" sx={{ color: "#fff" }} py={1} px={2}>
              <Link to={`/users/${video?.owner?._id}`}>
                <Typography color="#fff" sx={{ display: "flex" }}>
                  {video?.owner?.username}
                </Typography>
              </Link>
              <Stack direction="row" spacing={1}>
                <MuiButton variant="contained" onClick={handleClick}>
                  {subscribed ? 'Unsubscribe' : 'Subscribe'}
                </MuiButton>
               { video?.owner?._id===userData?._id && 
               <MuiButton variant="outlined" color="error" onClick={openDeleteDialog}>
                  Delete Video
                </MuiButton>
               }
              </Stack>
            </Stack>
            <Stack direction="row" gap="20px" alignItems="center" py={1} px={2}>
              <Typography sx={{ opacity: 0.7 }}>
                {parseInt(video?.views).toLocaleString()} views
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Box flex={1}>
          <Typography variant="h6" color="#fff" mb={2}>
            Comments
          </Typography>
          <Box sx={{ maxHeight: '400px', overflowY: 'auto', mb: 2 }}>
            {comments.length === 0 ? (
              <Typography color="#fff">No comments yet</Typography>
            ) : (
              comments.map((comment) => (
                <Box key={comment._id} sx={{ borderBottom: '1px solid #444', mb: 1, p: 1 }}>
                  <Typography variant="body2" color="#fff">
                    {comment.owner?.username || 'Anonymous'}:<strong> {comment?.content}</strong>
                  </Typography>
                </Box>
              ))
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            <TextField
              variant="outlined"
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              InputProps={{ style: { color: '#fff' } }}
              sx={{ bgcolor: '#333' }}
            />
            <MuiButton variant="contained" onClick={handleAddComment}>
              Add Comment
            </MuiButton>
          </Stack>
        </Box>
      </Stack>

      <Dialog open={confirmDelete} onClose={closeDeleteDialog}>
        <DialogTitle>Are you sure you want to delete this video?</DialogTitle>
        <DialogActions>
          <MuiButton onClick={closeDeleteDialog} color="primary">
            Cancel
          </MuiButton>
          <MuiButton onClick={handleDeleteVideo} color="error">
            Delete
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Video;