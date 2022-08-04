import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from "@material-ui/core";
import { ShoppingBasket } from "@material-ui/icons";
//Components
import Products from "./Products";
import Categories from "./Categories";
import OrdersPage from "./Orders";
const drawerWidth = 240;

const styles = (theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
});

class PersistentDrawerLeft extends React.Component {
  state = {
    open: false,
    showProducts: false,
    showCategories: true,
    category: "",
    userRole: "Admin",
    guestUser: "",
    showUser: false,
    showSetUsernameDialog: false,
    showOrders: false,
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  handleShowProducts = () => {
    this.setState({ showProducts: true, showCategories: false });
  };

  handleSelectCategory = (category) => {
    this.setState({ category });
    this.handleShowProducts();
  };

  handleBackToCategories = () => {
    this.setState({
      showProducts: false,
      showCategories: true,
      showOrders: false,
    });
  };
  handleRoles = (e) => {
    this.setState({ userRole: e.target.value });
  };

  handleOpenSetUserNameDialog = () => {
    const { guestUser } = this.state;
    if (!guestUser) {
      this.setState({ showSetUsernameDialog: true });
    }
  };

  handleCloseSetUserNameDialog = () => {
    this.setState({ showSetUsernameDialog: false });
  };

  handleSetUserName = (e) => {
    this.setState({ guestUser: e.target.value });
  };

  handleSubmit = () => {
    this.handleCloseSetUserNameDialog();
    this.setState({ showUser: true });
  };

  handleShowOrders = () => {
    this.setState({
      showOrders: true,
      showProducts: false,
      showCategories: false,
    });
  };

  render() {
    const { classes, theme } = this.props;
    const { open, userRole, showSetUsernameDialog, guestUser, showUser } =
      this.state;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <SetUsernameDialog
          dialogState={showSetUsernameDialog}
          onHandleClose={this.handleCloseSetUserNameDialog}
          onHandleSetUserName={this.handleSetUserName}
          onSubmit={this.handleSubmit}
        />
        <AppBar
          position="fixed"
          className={classNames(classes.appBar, {
            [classes.appBarShift]: open,
          })}
        >
          <Toolbar disableGutters={!open}>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(classes.menuButton, open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <Grid container>
              <Grid item xs={4}>
                <Typography variant="h6" color="inherit" noWrap>
                  XYZ Resto
                </Typography>
              </Grid>
              <Grid style={{ textAlign: "center" }} item xs={4}>
                {showUser && guestUser && (
                  <Typography variant="h6" color="inherit" noWrap>
                    {`Welcome: ${guestUser}`}
                  </Typography>
                )}
              </Grid>
              <Grid
                style={{ textAlign: "right", paddingRight: 15 }}
                item
                xs={4}
              >
                <Button onClick={this.handleShowOrders}>
                  <ShoppingBasket />
                </Button>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="persistent"
          anchor="left"
          open={open}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={this.handleDrawerClose}>
              {theme.direction === "ltr" ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </div>
          <Divider />
          <Select onChange={this.handleRoles} value={userRole}>
            <MenuItem
              onClick={() =>
                this.setState({
                  guestUser: "",
                })
              }
              value="Admin"
            >
              Admin
            </MenuItem>
            <MenuItem onClick={this.handleOpenSetUserNameDialog} value="Guest">
              Guest
            </MenuItem>
          </Select>
          <Divider />
        </Drawer>
        <main
          className={classNames(classes.content, {
            [classes.contentShift]: open,
          })}
        >
          <div className={classes.drawerHeader} />
          {this.state.showCategories && (
            <Categories
              selectCategory={this.handleSelectCategory}
              userRole={userRole}
            />
          )}
          {this.state.showProducts && (
            <Products
              userRole={userRole}
              backBtn={this.handleBackToCategories}
              category={this.state.category}
              guestUser={guestUser}
            />
          )}
          {this.state.showOrders && (
            <OrdersPage
              userRole={userRole}
              backBtn={this.handleBackToCategories}
              guestUser={guestUser}
            />
          )}
        </main>
      </div>
    );
  }
}

PersistentDrawerLeft.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(PersistentDrawerLeft);

const SetUsernameDialog = (props) => {
  const { onHandleClose, dialogState, onHandleSetUserName, onSubmit } = props;
  return (
    <Dialog
      open={dialogState}
      onClose={onHandleClose}
      disableEscapeKeyDown
      disableBackdropClick
    >
      <DialogContent>
        <TextField
          label="Name"
          placeholder="Enter name"
          onChange={onHandleSetUserName}
          style={{ width: 300 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onSubmit} color="primary" variant="contained">
          Enter as guest
        </Button>
        <Button onClick={onHandleClose} variant="text">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
