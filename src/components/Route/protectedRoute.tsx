import { useEffect } from "react";
import { appRoutes } from "../../../constants";
import { useSelector, useDispatch } from "react-redux";
import { enumUpdate } from "../../../store/actions/enums";
import useCRUD from "../hooks/useCRUD";

const isBrowser = () => typeof window !== "undefined";

const ProtectedRoute = ({ router, children }: any) => {
    const dispatch = useDispatch();
  //Identify authenticated user
  const { user, enums } = useSelector((state: any) => state);
  const isAuthenticated = !!user.id;

  const { handleGet } = useCRUD({ model: 'public', pathOptions: '/enums'});
  
  useEffect(() => {
    console.log("krl")
    if(!Object.keys(enums).length) {
        handleGet()
              .then(({ data, error }) => {
                console.log({ data, error })
                if(error) return;
                dispatch(enumUpdate(data));
              });
    };
  },[]);

  let unprotectedRoutes = [
    appRoutes.login
  ];

  let protectedRoutes = {
    student: [
      appRoutes.logout
    ],
    teacher: [
      
      appRoutes.home,
      appRoutes.logout
    ],
    admin: [
      appRoutes.home,
      appRoutes.logout,
      appRoutes.registerClass,
      appRoutes.registerTeacher
    ]
  }

    /**
   * @var pathIsProtected Checks if path exists in the unprotectedRoutes routes array
   */
     let pathIsProtected = unprotectedRoutes.indexOf(router.pathname) === -1;

     if (isBrowser() && !isAuthenticated && pathIsProtected) {
       router.push(appRoutes.login);
     }

     if(isAuthenticated && !protectedRoutes[user?.userType].find(url => url === router.pathname)) {
      router.push(protectedRoutes[user?.userType][0]);
     }

     if (isBrowser() && isAuthenticated && router.pathname === appRoutes.login) {
        router.push(appRoutes.home);
      }



  return  children;
};

export default ProtectedRoute;