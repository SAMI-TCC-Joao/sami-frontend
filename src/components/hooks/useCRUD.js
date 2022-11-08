import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { appRoutes } from "../../../constants";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const useCRUD = ({ model, options, pathOptions, headerOptions = {}, initialLoadingState = true, immediatlyLoadData = false }) => {
    const router = useRouter();
    const { user } = useSelector((state) => state)
    const { pathname } = router;
    const [loading, setLoading] = useState(initialLoadingState);
    const [data, setData] = useState(null);

    const headers = {
        'Content-Type': 'application/json',
        ...(user?.token && {'Authorization': `Bearer ${user?.token}`}),
        ...headerOptions
      };

    const throwError = useCallback((errorParam, displayToast = true) => {
        setLoading(false);
        const { response: { data: errorData = {} } = {} } = errorParam;
        const { code = '', statusCode = null, logout: shouldLogout, message = null } = errorData || {};
    
        if (code && shouldLogout) {
          return pathname === appRoutes.login ? null : router.push(appRoutes.logout);
        }
    
        const errMsg = message || `Ocorreu um erro ${code}`;

        if (displayToast && statusCode) toast.error(errMsg);
        return { error: { message: errMsg } };
      }, []);

    const handleGet = useCallback(
        ({ refetchOptions = null, refetchPathOptions = null, generateLoading = true, displayToast = true } = {}) => {

          if (generateLoading) setLoading(true);
    
          // eslint-disable-next-line consistent-return
          return axios
            .get(`${baseURL}/${model}${refetchPathOptions || pathOptions}`, {
              params: refetchOptions || options,
              headers
            })
            .catch(err => throwError(err, displayToast))
            .finally(() => {
              setLoading(false);
            });
        },
        [model, pathOptions]
      );

      const handleCreate = useCallback(
        ({ values = null, refetchOptions = null, refetchPathOptions = null, generateLoading = true, displayToast = true } = {}) => {

          if (generateLoading) setLoading(true);
    
          // eslint-disable-next-line consistent-return
          return axios
            .post(`${baseURL}/${model}${refetchPathOptions || pathOptions}`, values, {
              params: refetchOptions || options,
              headers
            })
            .catch(err => throwError(err, displayToast))
            .finally(() => {
              setLoading(false);
            });
        },
        [model, pathOptions]
      );

      const handleUpdate = useCallback(
        ({ values = null, id = '', refetchOptions = null, refetchPathOptions = null, generateLoading = true, displayToast = true } = {}) => {

          if (generateLoading) setLoading(true);
    
          // eslint-disable-next-line consistent-return
          return axios
            .put(`${baseURL}/${model}/${id}${refetchPathOptions || pathOptions}`, values, {
              params: refetchOptions || options,
              headers
            })
            .catch(err => throwError(err, displayToast))
            .finally(() => {
              setLoading(false);
            });
        },
        [model, pathOptions]
      );

      const handleDelete = useCallback(
        ({ values = null, id = '', refetchOptions = null, refetchPathOptions = null, generateLoading = true, displayToast = true } = {}) => {

          if (generateLoading) setLoading(true);
    
          // eslint-disable-next-line consistent-return
          return axios
            .delete(`${baseURL}/${model}/${id}${refetchPathOptions || pathOptions}`, {
                data: values,
              params: refetchOptions || options,
              headers
            })
            .catch(err => throwError(err, displayToast))
            .finally(() => {
              setLoading(false);
            });
        },
        [model, pathOptions]
      );

      useEffect(() => {
        if(immediatlyLoadData){
          handleGet().then(_data => {
            setData(_data);
          })
        }
      }, [immediatlyLoadData]);

      return {
        setLoading,
        loading,
        options,
        handleGet,
        handleUpdate,
        handleDelete,
        handleCreate,
        data
      };
}

export default useCRUD;