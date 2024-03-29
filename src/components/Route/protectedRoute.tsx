import { useEffect, useLayoutEffect, useState } from "react";
import { appRoutes } from "../../../constants";
import { useSelector, useDispatch } from "react-redux";
import { enumUpdate } from "../../../store/actions/enums";
import useCRUD from "../hooks/useCRUD";
import { toast } from "react-toastify";

const ProtectedRoute = ({ router, children }: any) => {
  const dispatch = useDispatch();
  //Identify authenticated user
  const { user, enums } = useSelector((state: any) => state);
  const { handleGet: userAuthenticated } = useCRUD({
    model: "auth",
    pathOptions: "is-authenticated",
  });
  const { handleGet } = useCRUD({ model: "enums" });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const backendStart = () => {
    return userAuthenticated({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
    }).then(({ data }) => {
      if (data) {
        return "success";
      } else {
        return "error";
      }
    });
  };

  const protectedRoutes = {
    student: [
      appRoutes.home,
      appRoutes.logout,
      appRoutes.classes,
      appRoutes.response,
    ],
    teacher: [
      appRoutes.home,
      appRoutes.logout,
      appRoutes.registerClass,
      appRoutes.classes,
      appRoutes.updateClass,
      appRoutes.recoverPassword,
      appRoutes.changePassword,
      appRoutes.registerForm,
      appRoutes.updateForm,
      appRoutes.allIndicators,
      appRoutes.oneIndicator,
      appRoutes.analysesIndicator,
      appRoutes.response,
    ],
    admin: [
      appRoutes.home,
      appRoutes.logout,
      appRoutes.registerTeacher,
      appRoutes.updateTeacher,
      appRoutes.recoverPassword,
      appRoutes.changePassword,
      appRoutes.registerForm,
      appRoutes.updateForm,
      appRoutes.response,
      appRoutes.allTeachers,
    ],
    default: [
      appRoutes.login,
      appRoutes.recoverPassword,
      appRoutes.changePassword,
      appRoutes.firstAccess,
    ],
  };

  useLayoutEffect(() => {
    if (initialLoad) {
      if (
        (router.pathname === appRoutes.login ||
          router.pathname === appRoutes.firstAccess ||
          router.pathname === appRoutes.index) &&
        user.token !== null
      ) {
        backendStart();
        setInitialLoad(false);
        setIsLoading(true);
        return;
      }

      toast.promise(
        backendStart(),
        {
          pending: "Validando informações...",
          success: "Informações validadas",
          error: "Erro ao validar informações",
        },
        {
          toastId: "backendStart",
        }
      );

      setInitialLoad(false);
    }

    if (user.token === null) {
      setIsLoading(true);
      return;
    }

    userAuthenticated({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then(async ({ data }) => {
        if (!data && !protectedRoutes.default.includes(router.pathname)) {
          setIsAuthenticated(false);
          setIsLoading(true);
          toast.error("Sessão expirada, por favor faça login novamente", {
            toastId: "auth",
          });
          return;
        }
        if (!data) {
          setIsAuthenticated(false);
          setIsLoading(true);
          return;
        }

        if (data.message === "User successfully logged in!") {
          setIsAuthenticated(true);
          setIsLoading(true);
          return;
        }
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(true);
      });
  }, [router.pathname]);

  useEffect(() => {
    handleGet()
      .then(({ data }) => {
        dispatch(enumUpdate(data));
      })
      .catch((error) => {
        console.log(error);
      });
  }, [isAuthenticated && !enums]);

  if (isLoading) {
    if (!user.id && protectedRoutes.default.includes(router.pathname)) {
      return children;
    }

    if (!isAuthenticated && router.pathname === appRoutes.login) {
      return children;
    }

    if (!isAuthenticated && router.pathname !== appRoutes.login) {
      router.push(appRoutes.login);
      return null;
    }

    if (
      isAuthenticated &&
      !(protectedRoutes[user?.userType] || []).find(
        (url) => url === router.pathname
      )
    ) {
      router.push(protectedRoutes[user?.userType]?.[0] || appRoutes.login);
      return null;
    }

    if (isAuthenticated && router.pathname === appRoutes.login) {
      router.push(appRoutes.home);
      return null;
    }

    return children;
  }
};

export default ProtectedRoute;