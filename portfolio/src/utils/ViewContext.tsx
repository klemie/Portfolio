import { 
    PropsWithChildren, 
    createContext, 
    useContext, 
    useReducer, 
    useState
} from "react";

// Pages
import Projects from "../views/pages/Projects";
import Experience from "../views/pages/Experience";
import Contact from "../views/pages/Contact";
import LandingPage from "../views/pages/LandingPage";

export enum Pages {
    ABOUT = "about",
    PROJECTS = "projects",
    EXPERIENCE = "experience",
    CONTACT = "contact",
    TITLE = "title"
}

type PageState = 
    Pages.ABOUT | 
    Pages.CONTACT | 
    Pages.CONTACT | 
    Pages.EXPERIENCE | 
    Pages.PROJECTS | 
    Pages.TITLE;

type PageAction =
    | { type: Pages.ABOUT, payload: string }
    | { type: Pages.PROJECTS, payload: string }
    | { type: Pages.EXPERIENCE, payload: string }
    | { type: Pages.CONTACT, payload: string }
    | { type: Pages.TITLE, payload: string };

function pageReducer (state: JSX.Element, action: PageAction): JSX.Element {
    console.log(state);
    switch (action.type) {
        case Pages.PROJECTS:
            return <Projects />;
        case Pages.EXPERIENCE:
            return <Experience />;
        case Pages.CONTACT:
            return <Contact />;
        case Pages.TITLE:
            return <LandingPage />;
        default:
            return <LandingPage />;
    }
}

export interface IViewContext {
    page: JSX.Element;
    showTitle: boolean;
    setTitle: (showTitle: boolean) => void;
    setPage: (page: PageState) => void;
}

const ViewContext = createContext<IViewContext>({
    page: <LandingPage />,
    showTitle: true,
    setTitle: () => {},
    setPage: () => {}
});

export const ViewProvider = ({ children }: PropsWithChildren) => {
    const [page, pageDispatch] = useReducer(pageReducer, <LandingPage />); 
    const [showTitle, setShowTitle] = useState<boolean>(true);
    const setTitle = (show: boolean) => setShowTitle(show);
    const setPage = (page: PageState) => {
        pageDispatch({ type: page, payload: page});
    };
    return (
        <ViewContext.Provider value={{ page, setPage, showTitle, setTitle }}>
            {children}
        </ViewContext.Provider>
    );
}

export const useViewContext = () => useContext<IViewContext>(ViewContext);