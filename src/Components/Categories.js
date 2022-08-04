import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TextareaAutosize,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { Add, Delete } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { db, storage } from "../db";
import { getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import uuid from "react-uuid";
import DashboardPage from "./Dashboard";
import { categoriesCollectionRef } from "../collections";
const styles = (theme) => ({
  root: {
    padding: 20,
  },
  title: {
    textAlign: "center",
  },
  imageStyle: {
    width: "inherit",
    height: " 400px",
  },
  starterText: {
    fontSize: "1rem",
  },
  categoryTextGrid: {
    paddingBottom: 20,
  },
  categoryContainerGrid: {
    paddingBottom: 20,
  },
  btnStarterGrid: {
    textAlign: "center",
  },
  imgBGC: {
    backgroundColor: "red",
  },
});
function Categories(props) {
  const { classes, selectCategory, userRole } = props;
  const [categories, setCategories] = useState([]);
  const [addDialog, setAddDialog] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);

  const imagesListRef = ref(storage, "images/");

  useEffect(() => {
    getCategories();
  }, []);

  const getImagesForCategories = () => {
    listAll(imagesListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageUrls((prev) => [...prev, url]);
        });
      });
    });
  };
  const getCategories = async () => {
    try {
      const data = await getDocs(categoriesCollectionRef);
      setCategories(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  const handleCreateCategory = async (newCategory) => {
    try {
      if (
        newCategory.categoryDescription !== "" ||
        newCategory.categoryName !== ""
      ) {
        await addDoc(categoriesCollectionRef, newCategory);
        handleCloseAddDialog();
        alert("Create successful!");
        getCategories();
        getImagesForCategories();
        return;
      }
      alert("All fields are required!");
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };
  const handleAddDialog = () => {
    setAddDialog((prevState) => !prevState);
  };
  const handleCloseAddDialog = () => {
    setAddDialog((prevState) => !prevState);
  };

  const handleDeleteCategory = async (id) => {
    try {
      const categoryDoc = doc(db, "Categories", id);
      await deleteDoc(categoryDoc);
      alert("Delete successful!");
      getCategories();
      return;
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  // const handleUpload = (newCategory) => {
  //   if (newCategory.categoryImage == null) return;
  //   const imageRef = ref(storage, `images/${newCategory.id}`);
  //   uploadBytes(imageRef, newCategory.categoryImage).then((snapshot) => {
  //     getDownloadURL(snapshot.ref).then((url) => {
  //       setImageUrls((prev) => [...prev, url]);
  //     });
  //   });
  // };

  const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  return (
    <>
      <AddDialog
        //handleUpload={handleUpload}
        handleCloseAddDialog={handleCloseAddDialog}
        dialogState={addDialog}
        handleCreateCategory={handleCreateCategory}
      />
      <Grid className={classes.root} container justifyContent="center">
        <div style={{ paddingBottom: 30 }}>
          {userRole === "Admin" && <DashboardPage />}
        </div>
        <Grid
          className={classes.categoryContainerGrid}
          container
          justifyContent="center"
          spacing={3}
        >
          {categories &&
            categories
              .sort((a, b) => {
                return b.createdAt - a.createdAt;
              })
              .map((data, idx) => (
                <Grid style={{ cursor: "pointer" }} key={data.id} item xs={4}>
                  <Card sx={{ maxWidth: 345 }}>
                    <div
                      onClick={() => selectCategory(data)}
                      style={{
                        height: 140,
                        backgroundColor: generateRandomColor(),
                      }}
                    ></div>
                    <CardContent onClick={() => selectCategory(data)}>
                      <Typography variant="h5">{data.categoryName}</Typography>
                      <Typography variant="body2">
                        {data.categoryDescription}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Grid style={{ textAlign: "right" }} item xs={12}>
                        {userRole === "Admin" && (
                          <Tooltip title="Delete Category" placement="bottom">
                            <Button
                              onClick={() => handleDeleteCategory(data.id)}
                            >
                              <Delete />
                            </Button>
                          </Tooltip>
                        )}
                      </Grid>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
        </Grid>
        <Grid style={{ textAlign: "right" }} item xs={12}>
          {userRole === "Admin" && (
            <Tooltip title="Add Category" placement="bottom">
              <Button onClick={handleAddDialog} variant="text">
                <Add />
              </Button>
            </Tooltip>
          )}
        </Grid>
      </Grid>
    </>
  );
}
Categories.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};
export default withStyles(styles, { withTheme: true })(Categories);

const AddDialog = (props) => {
  const { dialogState, handleCloseAddDialog, handleCreateCategory } = props;
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const handleClose = () => {
    setCategoryDescription("");
    setCategoryName("");
    handleCloseAddDialog();
  };

  return (
    <Dialog
      open={dialogState}
      onClose={handleClose}
      disableBackdropClick
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Typography style={{ textAlign: "center" }} variant="h4">
          Add New Category
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container justifyContent="center">
          {/* <Grid style={{ paddingBottom: 10 }} item xs={12}>
            <input type="file" onChange={handleChange} />
          </Grid> */}
          <Grid style={{ paddingBottom: 10 }} item xs={12}>
            <TextField
              fullWidth
              placeholder="e.g. Soup"
              label="Category Name"
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </Grid>
          <Grid style={{ paddingBottom: 10 }} item xs={12}>
            <TextareaAutosize
              aria-label="minimum height"
              minRows={3}
              placeholder="e.g Lorem Epsum"
              style={{ width: "100%" }}
              label="Description"
              onChange={(e) => setCategoryDescription(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setCategoryDescription("");
            setCategoryName("");
            handleCreateCategory({
              id: uuid(),
              categoryName,
              categoryDescription,
              createdAt: new Date().getTime(),
            });
          }}
          color="primary"
          variant="contained"
        >
          Create
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
